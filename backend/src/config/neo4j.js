import neo4j from "neo4j-driver";

const NEO4J_URI = process.env.NEO4J_URI || "bolt://localhost:7687";
const NEO4J_USER = process.env.NEO4J_USER || "neo4j";
const NEO4J_PASSWORD = process.env.NEO4J_PASSWORD || "neo4j";

let driver;

export function getDriver() {
  if (!driver) {
    driver = neo4j.driver(
      NEO4J_URI,
      neo4j.auth.basic(NEO4J_USER, NEO4J_PASSWORD),
      { disableLosslessIntegers: true }
    );
  }
  return driver;
}

export async function verifyConnectivity() {
  const d = getDriver();
  await d.verifyConnectivity();
}

/**
 * Exécute une requête Cypher dans une session, ferme proprement la session.
 * @param {string} cypher
 * @param {object} params
 * @param {"READ"|"WRITE"} mode
 */
export async function runQuery(cypher, params = {}, mode = "WRITE") {
  const session = getDriver().session({
    defaultAccessMode: mode === "READ" ? neo4j.session.READ : neo4j.session.WRITE
  });
  try {
    const result = await session.run(cypher, params);
    return result.records;
  } finally {
    await session.close();
  }
}

export async function closeDriver() {
  if (driver) {
    await driver.close();
    driver = undefined;
  }
}
