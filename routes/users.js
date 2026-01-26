const express = require("express");
const bcrypt = require("bcryptjs");
const router = express.Router();

const { User } = require("../models");

// ✅ REGISTRACE
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role, location, experience } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: "Chybí povinná pole" });
    }

    if (!["zadavatel", "zhotovitel"].includes(role)) {
      return res.status(400).json({ error: "Neplatná role" });
    }

    const exists = await User.findOne({ where: { email } });
    if (exists) {
      return res.status(400).json({ error: "Email už existuje" });
    }

    const hash = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hash,
      role,
      location,
      experience,
    });

    res.json({
      message: "Uživatel vytvořen",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Chyba serveru" });
  }
});

module.exports = router;
