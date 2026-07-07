import { Injectable } from '@nestjs/common';
import { Neo4jService } from '../neo4j/neo4j.service';

// Ce service gère la lecture des morceaux (recordings) stockés dans Neo4j.
// Un Recording = un morceau (ex: "HUMBLE." de Kendrick Lamar)

@Injectable()
export class RecordingsService {
  constructor(private neo4j: Neo4jService) {}

  // Récupère tous les morceaux, triés par titre (max 200)
  async getAll() {
    const records = await this.neo4j.run(
      `MATCH (r:Recording) RETURN r ORDER BY r.title LIMIT 200`,
    );
    return records.map((r) => r.get('r').properties);
  }

  // Récupère un morceau par son mbid (identifiant MusicBrainz)
  async getById(mbid: string) {
    const records = await this.neo4j.run(
      `MATCH (r:Recording {mbid: $mbid}) RETURN r`,
      { mbid },
    );
    return records.length ? records[0].get('r').properties : null;
  }

  // Récupère les artistes qui ont joué ou qui sont en feat sur un morceau
  async getArtists(mbid: string) {
    const records = await this.neo4j.run(
      // PERFORMED = l'artiste principal, FEATURED_ON = en featuring
      `MATCH (a:Artist)-[:PERFORMED|FEATURED_ON]->(r:Recording {mbid: $mbid})
       RETURN a`,
      { mbid },
    );
    return records.map((r) => r.get('a').properties);
  }

  // Récupère les albums sur lesquels ce morceau apparaît
  async getReleases(mbid: string) {
    const records = await this.neo4j.run(
      // APPEARS_ON = le morceau fait partie de cet album
      `MATCH (r:Recording {mbid: $mbid})-[:APPEARS_ON]->(rl:Release)
       RETURN rl`,
      { mbid },
    );
    return records.map((r) => r.get('rl').properties);
  }
}
