const express = require("express");
const router = express.Router();
const pool = require("../db");

/**
 * REGISTRACE
 */
router.post("/register", async (req, res) => {
  const { email, password, role } = req.body;

  if (!email || !password || !role) {
    return res.status(400).json({ error: "Chybí data" });
  }

  try {
    const result = await pool.query(
      "INSERT INTO users (email, password, role) VALUES ($1, $2, $3) RETURNING id, email, role",
      [email, password, role]
    );

    res.json({
      ok: true,
      user: result.rows[0]
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Uživatel už existuje nebo DB chyba" });
  }
});

/**
 * LOGIN
 */
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Chybí data" });
  }

  try {
    const result = await pool.query(
      "SELECT id, email, role FROM users WHERE email=$1 AND password=$2",
      [email, password]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Špatné přihlašovací údaje" });
    }

    res.json({
      ok: true,
      user: result.rows[0]
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "DB chyba" });
  }
});

module.exports = router;
