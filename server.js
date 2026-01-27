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
// REGISTRACE UŽIVATELE
// ======================
app.post("/api/users/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: "Chybí povinná pole" });
    }

    const exists = await User.findOne({ where: { email } });
    if (exists) {
      return res.status(400).json({ error: "Uživatel již existuje" });
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

// ======================
// VYTVOŘENÍ ZAKÁZKY
// ======================
app.post("/api/jobs", async (req, res) => {
  try {
    const {
      title,
      category,
      date,
      timeFrom,
      timeTo,
      location,
      reward,
      userId,
    } = req.body;

    if (
      !title ||
      !category ||
      !date ||
      timeFrom == null ||
      timeTo == null ||
      !location ||
      !reward ||
      !userId
    ) {
      return res.status(400).json({ error: "Chybí povinná pole" });
    }

    const job = await Job.create({
      title,
      category,
      date,
      timeFrom,
      timeTo,
      location,
      reward,
      userId,
    });

    res.json({
      message: "Zakázka vytvořena",
      job,
    });
  } catch (err) {
    console.error("JOB ERROR:", err);
    res.status(500).json({ error: "Chyba serveru" });
  }
});

// ======================
// START SERVERU
// ======================
const PORT = process.env.PORT || 5000;

sequelize.sync().then(() => {
  console.log("✅ DB připojena a synchronizována");
  app.listen(PORT, () => {
    console.log(`🚀 Server běží na portu ${PORT}`);
  });
});
