const express = require("express");
const router = express.Router();

const { Job, User } = require("../models");

/**
 * GET /api/jobs
 * Vrátí seznam zakázek z databáze
 */
router.get("/", async (req, res) => {
  try {
    const jobs = await Job.findAll({
      order: [["createdAt", "DESC"]],
    });

    res.json(jobs);
  } catch (err) {
    console.error("❌ Chyba při načítání zakázek:", err);
    res.status(500).json({ error: "Chyba serveru" });
  }
});

/**
 * POST /api/jobs
 * Vytvoření nové zakázky
 */
router.post("/", async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      location,
      reward,
      timeFrom,
      timeTo,
      customerId,
      waitingForHelper,
    } = req.body;

    if (!title || !description || !category || !location) {
      return res.status(400).json({ error: "Chybí povinná pole" });
    }

    const job = await Job.create({
      title,
      description,
      category,
      location,
      reward,
      timeFrom,
      timeTo,
      customerId,
      waitingForHelper,
      status: "waiting",
    });

    res.status(201).json(job);
  } catch (err) {
    console.error("❌ Chyba při vytváření zakázky:", err);
    res.status(500).json({ error: "Chyba serveru" });
  }
});

module.exports = router;
