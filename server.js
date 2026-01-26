const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();

// ===== MIDDLEWARE =====
app.use(cors());
app.use(express.json());

// ===== DB =====
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes("localhost")
    ? false
    : { rejectUnauthorized: false },
});

pool.connect()
  .then(() => console.log("✅ DB připojena"))
  .catch(err => console.error("❌ DB chyba", err));

// ===== TEST ROUTE =====
app.get("/", (req, res) => {
  res.json({ status: "API OK" });
});

// ===== USERS =====
app.post("/api/users/register", async (req, res) => {
  const { email, password, role } = req.body;

  if (!email || !password || !role) {
    return res.status(400).json({ error: "Chybí data" });
  }

  try {
    const result = await pool.query(
      "INSERT INTO users (email, password, role) VALUES ($1,$2,$3) RETURNING id,email,role",
      [email, password, role]
    );

    res.json({ success: true, user: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "DB chyba" });
  }
});

// ===== START SERVER =====
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server běží na portu ${PORT}`);
});
