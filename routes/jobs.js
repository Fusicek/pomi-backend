const express = require('express');
const router = express.Router();
const { Job } = require('../models/Job');

// GET /api/jobs – seznam zakázek
router.get('/', async (req, res) => {
  try {
    const jobs = await Job.findAll({
      order: [['createdAt', 'DESC']],
    });
    res.json(jobs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Chyba při načítání zakázek' });
  }
});

// POST /api/jobs – vytvoření zakázky
router.post('/', async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Chybí název zakázky' });
    }

    const job = await Job.create({
      title,
      description,
      status: 'open',
    });

    res.status(201).json(job);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Chyba při vytvoření zakázky' });
  }
});

module.exports = router;
import Job from "../models/Job.js";
import { JobStatus } from "../constants/jobStatus.js";
import { canTransition } from "../services/jobStateMachine.js";

/**
 * ZMĚNA STAVU ZAKÁZKY
 */
router.post("/:id/status", async (req, res) => {
  const { newStatus, agreedDate } = req.body;

  try {
    const job = await Job.findByPk(req.params.id);

    if (!job) {
      return res.status(404).json({ error: "Zakázka nenalezena" });
    }

    if (!canTransition(job.status, newStatus)) {
      return res.status(400).json({
        error: `Nelze přejít ze stavu ${job.status} do ${newStatus}`,
      });
    }

    job.status = newStatus;

    if (newStatus === JobStatus.AGREED && agreedDate) {
      job.agreedDate = agreedDate;
    }

    await job.save();

    res.json(job);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Chyba při změně stavu" });
  }
});



