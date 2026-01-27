const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const { sequelize, User, Job } = require("./models");

const app = express();
app.use(cors());
app.use(express.json());

// ======================
// TEST
// ======================
app.get("/", (req, res) => {
  res.json({ status: "API OK" });
});

// ======================
// REGISTRACE
// ======================
app.post("/api/users/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: "Chybí povinná pole" });
    }

    const exists = await User.findOne({ where: { email } });
    if (exists) {
      return res.status(400).json({ error: "Uživatel existuje" });
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
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Chyba serveru" });
  }
});

// ======================
// VYTVOŘENÍ ZAKÁZKY
// ======================
app.post("/api/jobs", async (req, res) => {
  try {
    const job = await Job.create(req.body);
    res.json(job);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Chyba serveru" });
  }
});

// ======================
// 🔥 VÝPIS ZAKÁZEK – TADY BYLA CHYBA
// ======================
app.get("/api/jobs", async (req, res) => {
  try {
    const jobs = await Job.findAll({
      order: [["createdAt", "DESC"]],
    });
    res.json(jobs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Chyba serveru" });
  }
});

// ======================
const PORT = process.env.PORT || 5000;

sequelize.sync({ alter: true }).then(() => {
  console.log("✅ DB synchronizována");
  app.listen(PORT, () =>
    console.log(`🚀 Server běží na portu ${PORT}`)
  );
});
