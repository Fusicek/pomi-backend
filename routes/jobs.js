const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { Job } = require('../models/Job');

// Získat všechny zakázky
router.get('/', auth, async (req, res) => {
  const jobs = await Job.findAll();
  res.json(jobs);
});

module.exports = router;
// Vytvořit novou zakázku
router.post('/', async (req, res) => {
  try {
    const job = await Job.create(req.body);
    res.json(job);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Nepodařilo se vytvořit zakázku' });
  }
});


