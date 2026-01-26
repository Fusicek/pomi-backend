const express = require("express");
const router = express.Router();
const Job = require("../models/Job");

router.post("/", async (req, res) => {
  try {
    console.log("📥 CREATE JOB BODY:", req.body);

    const {
      category,
      location,
      date,
      timeFrom,
      timeTo,
      reward,
      mode,
    } = req.body;

    // minimální kontrola – jen to nutné
    if (!category || !location || !date || !timeFrom || !timeTo) {
      return res
        .status(400)
        .json({ error: "Chybí povinná pole" });
    }

    const job = await Job.create({
      category,
      location,
      date,
      timeFrom,
      timeTo,
      reward,
      mode: mode || "wait",
    });

    console.log("✅ JOB CREATED:", job.id);

    res.status(201).json({
      message: "Zakázka vytvořena",
      job,
    });
  } catch (err) {
    console.error("❌ CREATE JOB ERROR:", err);
    res.status(500).json({
      error: "Chyba serveru při vytváření zakázky",
    });
  }
});

router.get("/", async (req, res) => {
  const jobs = await Job.findAll({
    order: [["createdAt", "DESC"]],
  });
  res.json(jobs);
});

module.exports = router;

