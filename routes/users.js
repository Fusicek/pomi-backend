const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

const router = express.Router();

/**
 * VYTVOŘENÍ PROFILU (pomocník)
 */
router.post("/profile", async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      location,
      experience,
      skills
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Chybí povinné údaje" });
    }

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({ message: "Uživatel už existuje" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "helper",
      location,
      experience,
      skills
    });

    res.json({ message: "Profil vytvořen", userId: user.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Chyba serveru" });
  }
});

module.exports = router;
