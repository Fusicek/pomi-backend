const express = require("express");
const Job = require("../models/Job");

const router = express.Router();

/**
 * Vytvořit zakázku
 */
router.post("/", async (req, res) => {
  try {
    const {
      type,
      location,
      date,
      timeFrom,
      timeTo,
      reward,
      mode,
    } = req.body;

    if (!type || !location || !date || !timeFrom || !timeTo || !mode) {
      return res.status(400).json({ message: "Chybí povinné údaje" });
    }

    const job = await Job.create({
      type,
      location,
      date,
      timeFrom,
      timeTo,
      reward,
      mode,
    });

    res.json({ message: "Zakázka vytvořena", job });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Chyba serveru" });
  }
});

/**
 * Seznam zakázek
 */
router.get("/", async (req, res) => {
  const jobs = await Job.findAll({ order: [["createdAt", "DESC"]] });
  res.json(jobs);
});

module.exports = router;
