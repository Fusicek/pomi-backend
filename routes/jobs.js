const express = require("express");
const router = express.Router();
const { Job } = require("../models");

// CREATE JOB
router.post("/", async (req, res) => {
  try {
    const job = await Job.create(req.body);
    res.json(job);
  } catch (err) {
    console.error("JOB CREATE ERROR:", err);
    res.status(500).json({ error: "Chyba serveru" });
  }
});

// GET ALL JOBS
router.get("/", async (req, res) => {
  try {
    const jobs = await Job.findAll();
    res.json(jobs);
  } catch (err) {
    console.error("JOB GET ERROR:", err);
    res.status(500).json({ error: "Chyba serveru" });
  }
});

// GET JOBS BY CUSTOMER
router.get("/my", async (req, res) => {
  const { customerId } = req.query;

  if (!customerId) {
    return res.status(400).json({ error: "Chybí customerId" });
  }

  try {
    const jobs = await Job.findAll({
      where: { customerId },
    });
    res.json(jobs);
  } catch (err) {
    console.error("JOB MY ERROR:", err);
    res.status(500).json({ error: "Chyba serveru" });
  }
});

module.exports = router;

