const express = require("express");
const router = express.Router();
const { User } = require("../models");

router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role, location } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: "Chybí povinná pole" });
    }

    const exists = await User.findOne({ where: { email } });
    if (exists) {
      return res.status(400).json({ error: "Email už existuje" });
    }

    const user = await User.create({
      name,
      email,
      password,
      role,
      location
    });

    res.json({ message: "Uživatel vytvořen", user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Chyba serveru" });
  }
});

module.exports = router;

