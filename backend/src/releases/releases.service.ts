import { Injectable } from '@nestjs/common';
import { Neo4jService } from '../neo4j/neo4j.service';

// Ce service gère la lecture des albums (releases) stockés dans Neo4j.
// Un Release = un album ou single (ex: "DAMN." de Kendrick Lamar)

@Injectable()
export class ReleasesService {
  constructor(private neo4j: Neo4jService) {}

  // Récupère tous les albums, triés par date (les plus récents d'abord)
  async getAll() {
    const records = await this.neo4j.run(
      `MATCH (rl:Release) RETURN rl ORDER BY rl.date DESC LIMIT 200`,
    );
    return records.map((r) => r.get('rl').properties);
  }

  // Récupère un album par son mbid
  async getById(mbid: string) {
    const records = await this.neo4j.run(
      `MATCH (rl:Release {mbid: $mbid}) RETURN rl`,
      { mbid },
    );
    return records.length ? records[0].get('rl').properties : null;
  }

  // Récupère les morceaux qui sont sur cet album
  async getRecordings(mbid: string) {
    const records = await this.neo4j.run(
      // On cherche les Recording qui ont une relation APPEARS_ON vers cet album
      `MATCH (r:Recording)-[:APPEARS_ON]->(rl:Release {mbid: $mbid})
       RETURN r ORDER BY r.title`,
      { mbid },
    );
    return records.map((r) => r.get('r').properties);
  }

  // Récupère les artistes qui ont des morceaux sur cet album
  async getArtists(mbid: string) {
    const records = await this.neo4j.run(
      // On traverse : artiste -> morceau -> album
      // DISTINCT = pas de doublons si l'artiste a plusieurs morceaux sur l'album
      `MATCH (a:Artist)-[:PERFORMED]->(r:Recording)-[:APPEARS_ON]->(rl:Release {mbid: $mbid})
       RETURN DISTINCT a`,
      { mbid },
    );
    return records.map((r) => r.get('a').properties);
  }
}
