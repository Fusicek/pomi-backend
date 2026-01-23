const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { User } = require('../models/User');

// Získat všechny uživatele
router.get('/', auth, async (req, res) => {
  const users = await User.findAll();
  res.json(users);
});

module.exports = router;
