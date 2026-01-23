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
