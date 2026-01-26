const express = require("express");
const router = express.Router();
const Job = require("../models/Job");

router.post("/", async (req, res) => {
  try {
    const {
      category,
      title,
      description,
      location,
      timeFrom,
      timeTo,
      reward,
      mode,
    } = req.body;

    if (!category || !title || !location || !timeFrom || !timeTo || !mode) {
      return res.status(400).json({ error: "Chybí povinná pole" });
    }

    const job = await Job.create({
      category,
      title,
      description,
      location,
      timeFrom,
      timeTo,
      reward,
      mode,
    });

    res.json(job);
  } catch (err) {
    console.error("CREATE JOB ERROR:", err);
    res.status(500).json({ error: "Chyba serveru" });
  }
});

router.get("/", async (req, res) => {
  const jobs = await Job.findAll();
  res.json(jobs);
});

module.exports = router;

