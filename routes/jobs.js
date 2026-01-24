const express = require("express");
const router = express.Router();
const { Job } = require("../models/Job");

/**
 * GET /api/jobs
 * veřejný výpis zakázek
 */
router.get("/", async (req, res) => {
  try {
    const jobs = await Job.findAll({
      order: [["createdAt", "DESC"]],
    });
    res.json(jobs);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Nepodařilo se načíst zakázky",
    });
  }
});

/**
 * POST /api/jobs
 * vytvoření nové zakázky
 */
router.post("/", async (req, res) => {
  const { title, description } = req.body;

  if (!title || !description) {
    return res.status(400).json({
      error: "Název a popis jsou povinné",
    });
  }

  try {
    const job = await Job.create({
      title,
      description,
    });

    res.json(job);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Nepodařilo se vytvořit zakázku",
    });
  }
});

module.exports = router;
