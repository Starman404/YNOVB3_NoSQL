import { Injectable } from '@nestjs/common';
import { Neo4jService } from '../neo4j/neo4j.service';

// Ce service calcule des statistiques sur notre base musicale.
// Chaque méthode fait une requête Cypher qui compte ou trie les données.

@Injectable()
export class StatsService {
  constructor(private neo4j: Neo4jService) {}

  // Vue d'ensemble : combien d'artistes, morceaux, albums, collabs et genres au total
  async getOverview() {
    const counts = await this.neo4j.run(
      // WITH = passe les résultats d'une étape à la suivante (comme un pipeline)
      // count() = compte le nombre de noeuds trouvés
      // On chaîne plusieurs MATCH pour compter chaque type de noeud
      `MATCH (a:Artist) WITH count(a) as artists
       MATCH (r:Recording) WITH artists, count(r) as recordings
       MATCH (rl:Release) WITH artists, recordings, count(rl) as releases
       OPTIONAL MATCH (:Artist)-[c:COLLABORATED_WITH]->(:Artist)
       WITH artists, recordings, releases, count(c) as collaborations
       OPTIONAL MATCH (g:Genre)
       RETURN artists, recordings, releases, collaborations, count(g) as genres`,
    );
    if (!counts.length) return { artists: 0, recordings: 0, releases: 0, collaborations: 0, genres: 0 };
    const r = counts[0];
    // .toNumber() car Neo4j renvoie des Integer (pas des numbers JS classiques)
    return {
      artists: r.get('artists').toNumber(),
      recordings: r.get('recordings').toNumber(),
      releases: r.get('releases').toNumber(),
      collaborations: r.get('collaborations').toNumber(),
      genres: r.get('genres').toNumber(),
    };
  }

  // Top 20 artistes classés par nombre de morceaux
  async getTopArtists() {
    const records = await this.neo4j.run(
      // count(r) = on compte combien de morceaux chaque artiste a
      // ORDER BY trackCount DESC = du plus au moins (décroissant)
      `MATCH (a:Artist)-[:PERFORMED]->(r:Recording)
       RETURN a.name as name, a.mbid as mbid, count(r) as trackCount
       ORDER BY trackCount DESC
       LIMIT 20`,
    );
    return records.map((r) => ({
      name: r.get('name'),
      mbid: r.get('mbid'),
      trackCount: r.get('trackCount').toNumber(),
    }));
  }

  // Top 20 paires d'artistes qui collaborent le plus
  async getTopCollaborations() {
    const records = await this.neo4j.run(
      // id(a) < id(b) = astuce pour éviter les doublons (A-B et B-A)
      // On compte les morceaux en commun entre chaque paire
      `MATCH (a:Artist)-[:COLLABORATED_WITH]-(b:Artist)
       WHERE id(a) < id(b)
       OPTIONAL MATCH (a)-[:PERFORMED|FEATURED_ON]->(r:Recording)<-[:PERFORMED|FEATURED_ON]-(b)
       RETURN a.name as artist1, b.name as artist2,
              a.mbid as mbid1, b.mbid as mbid2,
              count(DISTINCT r) as sharedTracks
       ORDER BY sharedTracks DESC
       LIMIT 20`,
    );
    return records.map((r) => ({
      artist1: r.get('artist1'),
      artist2: r.get('artist2'),
      mbid1: r.get('mbid1'),
      mbid2: r.get('mbid2'),
      sharedTracks: r.get('sharedTracks').toNumber(),
    }));
  }

  // Top 20 genres les plus populaires (par nombre d'artistes associés)
  async getTopGenres() {
    const records = await this.neo4j.run(
      // On compte combien d'artistes sont liés à chaque genre
      `MATCH (a:Artist)-[:ASSOCIATED_WITH_GENRE]->(g:Genre)
       RETURN g.name as genre, count(a) as artistCount
       ORDER BY artistCount DESC
       LIMIT 20`,
    );
    return records.map((r) => ({
      genre: r.get('genre'),
      artistCount: r.get('artistCount').toNumber(),
    }));
  }
}
