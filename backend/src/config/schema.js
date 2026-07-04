import { runQuery } from "./neo4j.js";

/**
 * Crée les contraintes d'unicité sur les MBID pour chaque type de nœud.
 * Idempotent : peut être exécuté à chaque démarrage sans risque.
 */
export async function initSchema() {
  const constraints = [
    "CREATE CONSTRAINT artist_mbid IF NOT EXISTS FOR (a:Artist) REQUIRE a.mbid IS UNIQUE",
    "CREATE CONSTRAINT recording_mbid IF NOT EXISTS FOR (r:Recording) REQUIRE r.mbid IS UNIQUE",
    "CREATE CONSTRAINT release_mbid IF NOT EXISTS FOR (r:Release) REQUIRE r.mbid IS UNIQUE",
    "CREATE CONSTRAINT label_mbid IF NOT EXISTS FOR (l:Label) REQUIRE l.mbid IS UNIQUE",
    "CREATE CONSTRAINT area_mbid IF NOT EXISTS FOR (a:Area) REQUIRE a.mbid IS UNIQUE",
    "CREATE CONSTRAINT genre_name IF NOT EXISTS FOR (g:Genre) REQUIRE g.name IS UNIQUE"
  ];

  for (const cypher of constraints) {
    await runQuery(cypher, {}, "WRITE");
  }

  console.log("[schema] Contraintes Neo4j initialisées.");
}
