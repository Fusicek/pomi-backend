const express = require('express');
const router = express.Router();
const { Review } = require('../models/Review');

// Získat všechny recenze
router.get('/', async (req, res) => {
  const reviews = await Review.findAll();
  res.json(reviews);
});

module.exports = router;
