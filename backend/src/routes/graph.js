import express from "express";

const router = express.Router();

// TODO: implémenté à l'étape suivante du projet
router.get("/", (req, res) => {
  res.status(501).json({ message: "Route graph pas encore implémentée" });
});

export default router;
