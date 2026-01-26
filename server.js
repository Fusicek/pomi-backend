const express = require("express");
const pool = require("./db");

const usersRoutes = require("./routes/users");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    ok: true,
    message: "Pomi backend běží"
  });
});

app.get("/db-test", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({
      ok: true,
      dbTime: result.rows[0].now
    });
  } catch (err) {
    res.status(500).json({ ok: false });
  }
});

/* ROUTES */
app.use("/api/users", usersRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Server běží na portu ${PORT}`);
});
