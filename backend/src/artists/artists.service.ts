import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Neo4jService } from '../neo4j/neo4j.service';
import { MusicbrainzService } from '../musicbrainz/musicbrainz.service';

// Un MBID MusicBrainz est un UUID v4 standard (ex: 7ece07e2-e284-4c31-a019-a65ada19e27a).
// On vérifie ce format avant d'appeler MusicBrainz pour éviter des appels inutiles
// et des messages d'erreur peu clairs sur des identifiants factices/malformés.
const MBID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// =====================================================
// PETIT GUIDE CYPHER (le langage de requêtes de Neo4j)
// =====================================================
// Dans Neo4j, les données sont des NOEUDS et des RELATIONS (pas des tables).
//
// Noeud   = (a:Artist {name: "Booba"})     -> un cercle dans le graphe
// Relation = (a)-[:PERFORMED]->(r)          -> une flèche entre deux noeuds
//
// MATCH   = chercher des noeuds/relations (comme SELECT en SQL)
// MERGE   = créer si ça existe pas, sinon ne rien faire (évite les doublons)
// SET     = modifier les propriétés d'un noeud
// RETURN  = renvoyer les résultats
// WHERE   = filtrer (comme WHERE en SQL)
// OPTIONAL MATCH = comme MATCH mais renvoie null si rien trouvé (comme LEFT JOIN)
// DETACH DELETE  = supprimer un noeud ET toutes ses relations
// collect()      = regrouper des valeurs en liste
// $variable      = paramètre passé depuis le code (sécurisé, pas d'injection)
// =====================================================

@Injectable()
export class ArtistsService {
  constructor(
    private neo4j: Neo4jService,
    private mb: MusicbrainzService,
  ) {}

  // Recherche un artiste sur MusicBrainz (API externe, pas dans notre base)
  async searchArtists(query: string) {
    return this.mb.searchArtists(query);
  }

  // Importe un artiste depuis MusicBrainz vers Neo4j
  async importArtist(mbid: string) {
    if (!mbid || !MBID_REGEX.test(mbid)) {
      throw new BadRequestException(`MBID invalide : "${mbid}". Un MBID MusicBrainz est un UUID (ex: 7ece07e2-e284-4c31-a019-a65ada19e27a).`);
    }

    // 1. On récupère les infos de l'artiste depuis MusicBrainz
    // (le service MusicBrainz convertit déjà les 404 MusicBrainz en NotFoundException)
    const artist = await this.mb.getArtist(mbid);

    // 2. On crée (ou met à jour) le noeud Artist dans Neo4j
    // MERGE = si un Artist avec ce mbid existe déjà, on le met à jour au lieu d'en créer un doublon
    await this.neo4j.run(
      `MERGE (a:Artist {mbid: $mbid})
       SET a.name = $name,
           a.type = $type,
           a.country = $country,
           a.gender = $gender,
           a.beginDate = $beginDate,
           a.endDate = $endDate,
           a.disambiguation = $disambiguation
       RETURN a`,
      {
        mbid: artist.id,
        name: artist.name,
        type: artist.type || null,
        country: artist.country || null,
        gender: artist.gender || null,
        beginDate: artist['life-span']?.begin || null,
        endDate: artist['life-span']?.end || null,
        disambiguation: artist.disambiguation || null,
      },
    );

    // 3. On crée les noeuds Genre et on les relie à l'artiste
    // Ex: (Booba)-[:ASSOCIATED_WITH_GENRE]->(rap)
    if (artist.genres?.length) {
      for (const genre of artist.genres) {
        await this.neo4j.run(
          `MERGE (g:Genre {name: $genre})
           WITH g
           MATCH (a:Artist {mbid: $mbid})
           MERGE (a)-[:ASSOCIATED_WITH_GENRE]->(g)`,
          { genre: genre.name, mbid: artist.id },
        );
      }
    }

    // 4. On crée le noeud Area (pays) et on le relie à l'artiste
    // Ex: (Booba)-[:FROM_AREA]->(FR)
    if (artist.country) {
      await this.neo4j.run(
        `MERGE (area:Area {name: $country, type: 'Country'})
         WITH area
         MATCH (a:Artist {mbid: $mbid})
         MERGE (a)-[:FROM_AREA]->(area)`,
        { country: artist.country, mbid: artist.id },
      );
    }

    // 5. On importe ses morceaux et ses albums.
    // On isole ces deux étapes : si MusicBrainz répond mal (429/503/timeout) sur
    // les morceaux ou les albums, l'artiste reste importé quand même plutôt que
    // de tout perdre à cause d'une erreur partielle.
    const warnings: string[] = [];

    try {
      await this.importRecordings(mbid);
    } catch (err: any) {
      warnings.push(`Import des morceaux incomplet : ${err.message}`);
    }

    try {
      await this.importReleases(mbid);
    } catch (err: any) {
      warnings.push(`Import des albums incomplet : ${err.message}`);
    }

    return {
      success: true,
      artist: artist.name,
      mbid: artist.id,
      ...(warnings.length ? { warnings } : {}),
    };
  }

  // Importe les morceaux (recordings) d'un artiste
  private async importRecordings(artistMbid: string) {
    // On récupère max 50 morceaux depuis MusicBrainz
    const data = await this.mb.getArtistRecordings(artistMbid, 50);
    const recordings = data.recordings || [];

    for (const rec of recordings) {
      // On crée le noeud Recording et la relation PERFORMED
      // Ex: (Kendrick Lamar)-[:PERFORMED]->(HUMBLE.)
      await this.neo4j.run(
        `MERGE (r:Recording {mbid: $mbid})
         SET r.title = $title,
             r.length = $length,
             r.firstReleaseDate = $firstReleaseDate
         WITH r
         MATCH (a:Artist {mbid: $artistMbid})
         MERGE (a)-[:PERFORMED]->(r)`,
        {
          mbid: rec.id,
          title: rec.title,
          length: rec.length || null,
          firstReleaseDate: rec['first-release-date'] || null,
          artistMbid,
        },
      );

      // On vérifie si d'autres artistes sont crédités sur ce morceau (featuring)
      await this.detectCollaborations(rec, artistMbid);
    }
  }

  // Détecte les collaborations (featurings) sur un morceau
  private async detectCollaborations(recording: any, mainArtistMbid: string) {
    const featPatterns = /\b(feat\.?|featuring|ft\.?|avec|&|x)\b/i;

    // Si MusicBrainz indique plusieurs artistes crédités sur ce morceau
    if (recording['artist-credit']?.length > 1) {
      for (const credit of recording['artist-credit']) {
        // On ignore l'artiste principal (on veut juste les featurings)
        if (!credit.artist || credit.artist.id === mainArtistMbid) continue;

        const collab = credit.artist;
        // On crée le noeud de l'artiste en feat, et les relations
        // Ex: (Pharrell)-[:FEATURED_ON]->(Get Lucky)
        //     (Daft Punk)-[:COLLABORATED_WITH]->(Pharrell)
        await this.neo4j.run(
          `MERGE (ca:Artist {mbid: $collabMbid})
           SET ca.name = $collabName, ca.type = $collabType
           WITH ca
           MATCH (r:Recording {mbid: $recMbid})
           MERGE (ca)-[:FEATURED_ON]->(r)
           WITH ca
           MATCH (a:Artist {mbid: $mainMbid})
           MERGE (a)-[:COLLABORATED_WITH]->(ca)`,
          {
            collabMbid: collab.id,
            collabName: collab.name,
            collabType: collab.type || null,
            recMbid: recording.id,
            mainMbid: mainArtistMbid,
          },
        );
      }
    }

    // Si le titre contient "feat.", "ft.", etc. on le marque
    if (featPatterns.test(recording.title || '')) {
      await this.neo4j.run(
        `MATCH (r:Recording {mbid: $recMbid})
         SET r.hasFeaturing = true`,
        { recMbid: recording.id },
      );
    }
  }

  // Importe les albums/releases d'un artiste
  private async importReleases(artistMbid: string) {
    const data = await this.mb.getArtistReleases(artistMbid, 50);
    const releases = data.releases || [];

    for (const rel of releases) {
      // On crée le noeud Release (album)
      await this.neo4j.run(
        `MERGE (rl:Release {mbid: $mbid})
         SET rl.title = $title,
             rl.date = $date,
             rl.country = $country,
             rl.status = $status,
             rl.releaseType = $releaseType`,
        {
          mbid: rel.id,
          title: rel.title,
          date: rel.date || null,
          country: rel.country || null,
          status: rel.status || null,
          releaseType: rel['release-group']?.['primary-type'] || null,
        },
      );

      // On relie l'album à son label
      // Ex: (Random Access Memories)-[:RELEASED_BY]->(Columbia)
      if (rel['label-info']?.length) {
        for (const li of rel['label-info']) {
          if (!li.label) continue;
          await this.neo4j.run(
            `MERGE (l:Label {name: $labelName})
             SET l.mbid = $labelMbid
             WITH l
             MATCH (rl:Release {mbid: $relMbid})
             MERGE (rl)-[:RELEASED_BY]->(l)`,
            {
              labelName: li.label.name,
              labelMbid: li.label.id || null,
              relMbid: rel.id,
            },
          );
        }
      }

      // On relie l'album à son pays de sortie
      if (rel.country) {
        await this.neo4j.run(
          `MERGE (area:Area {name: $country, type: 'Country'})
           WITH area
           MATCH (rl:Release {mbid: $relMbid})
           MERGE (rl)-[:RELEASED_IN]->(area)`,
          { country: rel.country, relMbid: rel.id },
        );
      }
    }

    // On essaie de relier les morceaux aux albums quand les titres correspondent
    await this.linkRecordingsToReleases(artistMbid);
  }

  // Relie les morceaux aux albums quand le titre correspond
  private async linkRecordingsToReleases(artistMbid: string) {
    // Ex: (Get Lucky)-[:APPEARS_ON]->(Random Access Memories)
    await this.neo4j.run(
      `MATCH (a:Artist {mbid: $mbid})-[:PERFORMED]->(r:Recording)
       MATCH (rl:Release)
       WHERE rl.title = r.title OR r.title CONTAINS rl.title
       MERGE (r)-[:APPEARS_ON]->(rl)`,
      { mbid: artistMbid },
    );
  }

  // =====================================================
  // LECTURE DES DONNÉES (les endpoints GET)
  // =====================================================

  // Récupère tous les artistes avec leurs genres et pays
  async getAll() {
    const records = await this.neo4j.run(
      // OPTIONAL MATCH = si l'artiste n'a pas de genre, on le renvoie quand même (comme LEFT JOIN)
      // collect() = regroupe tous les genres en une liste ["rap", "hip hop", ...]
      `MATCH (a:Artist)
       OPTIONAL MATCH (a)-[:ASSOCIATED_WITH_GENRE]->(g:Genre)
       OPTIONAL MATCH (a)-[:FROM_AREA]->(area:Area)
       RETURN a, collect(DISTINCT g.name) as genres, area.name as area
       ORDER BY a.name LIMIT 100`,
    );
    return records.map((r) => ({
      ...r.get('a').properties,
      genres: r.get('genres'),
      area: r.get('area'),
    }));
  }

  // Récupère un artiste par son mbid
  async getById(mbid: string) {
    const records = await this.neo4j.run(
      `MATCH (a:Artist {mbid: $mbid})
       OPTIONAL MATCH (a)-[:ASSOCIATED_WITH_GENRE]->(g:Genre)
       OPTIONAL MATCH (a)-[:FROM_AREA]->(area:Area)
       RETURN a, collect(DISTINCT g.name) as genres, area.name as country`,
      { mbid },
    );
    if (!records.length) {
      throw new NotFoundException(`Aucun artiste importé avec le mbid "${mbid}". Importez-le d'abord via POST /api/import/artists.`);
    }
    const r = records[0];
    return {
      ...r.get('a').properties,
      genres: r.get('genres'),
      area: r.get('country'),
    };
  }

  // Récupère les morceaux d'un artiste (ceux qu'il a joués OU sur lesquels il est en feat)
  async getRecordings(mbid: string) {
    const records = await this.neo4j.run(
      // Le "|" c'est un OU : on cherche les relations PERFORMED ou FEATURED_ON
      `MATCH (a:Artist {mbid: $mbid})-[:PERFORMED|FEATURED_ON]->(r:Recording)
       RETURN r ORDER BY r.title`,
      { mbid },
    );
    return records.map((r) => r.get('r').properties);
  }

  // Récupère les albums d'un artiste en suivant le chemin : Artist -> Recording -> Release
  async getReleases(mbid: string) {
    const records = await this.neo4j.run(
      // On traverse le graphe : artiste -> morceau -> album
      // DISTINCT = pas de doublons si plusieurs morceaux sont sur le même album
      `MATCH (a:Artist {mbid: $mbid})-[:PERFORMED]->(:Recording)-[:APPEARS_ON]->(rl:Release)
       RETURN DISTINCT rl ORDER BY rl.date DESC`,
      { mbid },
    );
    return records.map((r) => r.get('rl').properties);
  }

  // Supprime un artiste et tous ses morceaux
  async deleteArtist(mbid: string) {
    // D'abord on supprime ses morceaux (DETACH = supprime aussi les relations)
    await this.neo4j.run(
      `MATCH (a:Artist {mbid: $mbid})-[:PERFORMED|FEATURED_ON]->(r:Recording)
       DETACH DELETE r`,
      { mbid },
    );
    // Puis on supprime l'artiste lui-même
    await this.neo4j.run(
      `MATCH (a:Artist {mbid: $mbid})
       DETACH DELETE a`,
      { mbid },
    );
    return { success: true, deleted: mbid };
  }

  // Récupère les collaborations d'un artiste (les autres artistes avec qui il a travaillé)
  async getCollaborations(mbid: string) {
    const records = await this.neo4j.run(
      // Le "-" sans flèche = relation dans les deux sens (A->B ou B->A)
      // On cherche aussi les morceaux en commun entre les deux artistes
      `MATCH (a:Artist {mbid: $mbid})-[:COLLABORATED_WITH]-(b:Artist)
       OPTIONAL MATCH (a)-[:PERFORMED|FEATURED_ON]->(r:Recording)<-[:PERFORMED|FEATURED_ON]-(b)
       RETURN b, collect(DISTINCT r.title) as sharedTracks`,
      { mbid },
    );
    return records.map((r) => ({
      artist: r.get('b').properties,
      sharedTracks: r.get('sharedTracks'),
    }));
  }
}
