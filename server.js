const express = require("express");
const pool = require("./db");

const app = express();
const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.json({
    ok: true,
    message: "Pomi backend běží"
  });
});

/**
 * TEST DB PŘIPOJENÍ
 */
app.get("/db-test", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({
      ok: true,
      dbTime: result.rows[0].now
    });
  } catch (err) {
    console.error("DB error:", err);
    res.status(500).json({
      ok: false,
      error: "DB connection failed"
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server běží na portu ${PORT}`);
});
