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


