const express = require("express");
const router = express.Router();
const { Job } = require("../models");

// ============================
// GET /api/jobs
// všechny zakázky
// ============================
router.get("/", async (req, res) => {
  try {
    const jobs = await Job.findAll({
      order: [["createdAt", "DESC"]],
    });

    res.json(jobs);
  } catch (err) {
    console.error("GET JOBS ERROR:", err);
    res.status(500).json({ error: "Chyba serveru" });
  }
});

// ============================
// GET /api/jobs/my?customerId=1
// zakázky jednoho zadavatele
// ============================
router.get("/my", async (req, res) => {
  const { customerId } = req.query;

  if (!customerId) {
    return res.status(400).json({ error: "Chybí customerId" });
  }

  try {
    const jobs = await Job.findAll({
      where: { customerId },
      order: [["createdAt", "DESC"]],
    });

    res.json(jobs);
  } catch (err) {
    console.error("GET MY JOBS ERROR:", err);
    res.status(500).json({ error: "Chyba serveru" });
  }
});

// ============================
// POST /api/jobs
// vytvoření zakázky
// ============================
router.post("/", async (req, res) => {
  try {
    const job = await Job.create(req.body);
    res.status(201).json(job);
  } catch (err) {
    console.error("JOB CREATE ERROR:", err);
    res.status(500).json({ error: "Chyba serveru" });
  }
});

module.exports = router;
