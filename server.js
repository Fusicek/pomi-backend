require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");

const { sequelize, User, Job } = require("./models");

const app = express();
app.use(cors());
app.use(express.json());

/* =========================
   TEST
========================= */
app.get("/", (req, res) => {
  res.json({ status: "API OK" });
});

/* =========================
   REGISTER USER
========================= */
app.post("/api/users/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: "Chybí povinná pole" });
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
    console.error("REGISTER ERROR:", err);
    res.status(500).json({ error: "Chyba serveru" });
  }
});

/* =========================
   CREATE JOB
========================= */
app.post("/api/jobs", async (req, res) => {
  try {
    const job = await Job.create(req.body);
    res.json({
      message: "Zakázka vytvořena",
      job,
    });
  } catch (err) {
    console.error("JOB CREATE ERROR:", err);
    res.status(500).json({ error: "Chyba serveru" });
  }
});

/* =========================
   GET ALL JOBS
========================= */
app.get("/api/jobs", async (req, res) => {
  try {
    const jobs = await Job.findAll({
      order: [["createdAt", "DESC"]],
    });
    res.json(jobs);
  } catch (err) {
    console.error("JOB LIST ERROR:", err);
    res.status(500).json({ error: "Chyba serveru" });
  }
});

/* =========================
   🧑 DASHBOARD ZADAVATELE
   jen moje zakázky
========================= */
app.get("/api/jobs/my", async (req, res) => {
  try {
    const { customerId } = req.query;

    if (!customerId) {
      return res.status(400).json({ error: "Chybí customerId" });
    }

    const jobs = await Job.findAll({
      where: { customerId },
      order: [["createdAt", "DESC"]],
    });

    res.json(jobs);
  } catch (err) {
    console.error("MY JOBS ERROR:", err);
    res.status(500).json({ error: "Chyba serveru" });
  }
});

/* =========================
   START SERVER
========================= */
const PORT = process.env.PORT || 5000;

sequelize
  .sync({ alter: true })
  .then(() => {
    console.log("✅ DB synchronizována");
    app.listen(PORT, () =>
      console.log(`🚀 Server běží na portu ${PORT}`)
    );
  })
  .catch((err) => {
    console.error("❌ DB chyba:", err);
  });

