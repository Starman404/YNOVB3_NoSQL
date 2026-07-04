import "dotenv/config";
import app from "./app.js";
import { verifyConnectivity, closeDriver } from "./config/neo4j.js";
import { initSchema } from "./config/schema.js";

const PORT = process.env.PORT || 4000;

async function start() {
  try {
    await verifyConnectivity();
    console.log("[neo4j] Connexion établie.");
    await initSchema();
  } catch (err) {
    console.error("[neo4j] Impossible de se connecter :", err.message);
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`[server] MusicGraph API démarrée sur le port ${PORT}`);
  });
}

process.on("SIGINT", async () => {
  await closeDriver();
  process.exit(0);
});
process.on("SIGTERM", async () => {
  await closeDriver();
  process.exit(0);
});

start();
