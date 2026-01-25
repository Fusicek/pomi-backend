import express from "express";
import Rating from "../models/Rating.js";

const router = express.Router();

/**
 * VYTVOŘENÍ HODNOCENÍ
 */
router.post("/", async (req, res) => {
  const {
    jobId,
    fromUserEmail,
    toUserEmail,
    score,
    comment,
    role,
  } = req.body;

  if (!score || score < 1 || score > 5) {
    return res.status(400).json({ error: "Neplatné hodnocení" });
  }

  try {
    const rating = await Rating.create({
      jobId,
      fromUserEmail,
      toUserEmail,
      score,
      comment,
      role,
    });

    res.json(rating);
  } catch {
    res.status(500).json({ error: "Nelze uložit hodnocení" });
  }
});

/**
 * ZÍSKÁNÍ HODNOCENÍ PRO UŽIVATELE (NEVEŘEJNÉ)
 */
router.get("/for/:email", async (req, res) => {
  try {
    const ratings = await Rating.findAll({
      where: { toUserEmail: req.params.email },
      order: [["createdAt", "DESC"]],
    });

    res.json(ratings);
  } catch {
    res.status(500).json({ error: "Nelze načíst hodnocení" });
  }
});

export default router;
