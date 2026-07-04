import express from "express";
import cors from "cors";
import morgan from "morgan";

import artistsRouter from "./routes/artists.js";
import recordingsRouter from "./routes/recordings.js";
import releasesRouter from "./routes/releases.js";
import searchRouter from "./routes/search.js";
import importRouter from "./routes/import.js";
import graphRouter from "./routes/graph.js";
import statsRouter from "./routes/stats.js";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173"
  })
);
app.use(express.json());
app.use(morgan("dev"));

app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "musicgraph-backend" });
});

app.use("/api/artists", artistsRouter);
app.use("/api/recordings", recordingsRouter);
app.use("/api/releases", releasesRouter);
app.use("/api/search", searchRouter);
app.use("/api/import", importRouter);
app.use("/api/graph", graphRouter);
app.use("/api/stats", statsRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route non trouvée", path: req.originalUrl });
});

// Handler d'erreurs global
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    error: err.message || "Erreur interne du serveur"
  });
});

export default app;
