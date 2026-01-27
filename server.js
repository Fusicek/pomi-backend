const express = require("express");
const { sequelize, User, Job } = require("./models");

const app = express();
app.use(express.json());

/* ===== TEST ===== */
app.get("/", (req, res) => {
  res.json({ status: "API OK" });
});

/* ===== USERS ===== */
app.post("/api/users/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: "Chybí povinná pole" });
    }

    const user = await User.create({ name, email, password, role });
    res.status(201).json(user);
  } catch (err) {
    console.error("REGISTER ERROR:", err);
    res.status(500).json({ error: "Chyba serveru" });
  }
});

/* ===== JOBS ===== */
app.post("/api/jobs", async (req, res) => {
  try {
    const job = await Job.create(req.body);
    res.status(201).json(job);
  } catch (err) {
    console.error("JOB CREATE ERROR:", err);
    res.status(500).json({ error: "Chyba serveru" });
  }
});

app.get("/api/jobs", async (req, res) => {
  try {
    const jobs = await Job.findAll();
    res.json(jobs);
  } catch (err) {
    console.error("GET JOBS ERROR:", err);
    res.status(500).json({ error: "Chyba serveru" });
  }
});

/* ===== START ===== */
const PORT = process.env.PORT || 5000;

sequelize.sync()
  .then(() => {
    console.log("✅ DB synchronizována");
    app.listen(PORT, () =>
      console.log(`🚀 Server běží na portu ${PORT}`)
    );
  })
  .catch(err => {
    console.error("❌ DB chyba:", err);
  });

