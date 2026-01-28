const express = require("express");
const { Sequelize, DataTypes } = require("sequelize");
const bcrypt = require("bcrypt");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

/* =========================
   DATABASE
========================= */

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  protocol: "postgres",
  logging: false,
});

/* =========================
   MODELS
========================= */

const User = sequelize.define("User", {
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, unique: true, allowNull: false },
  password: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.ENUM("zadavatel", "zhotovitel"), allowNull: false },
});

const Job = sequelize.define("Job", {
  title: { type: DataTypes.STRING, allowNull: false },
  category: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: false },
  reward: { type: DataTypes.STRING, allowNull: false },
  date: { type: DataTypes.DATEONLY, allowNull: false },
  timeFrom: { type: DataTypes.INTEGER, allowNull: false },
  timeTo: { type: DataTypes.INTEGER, allowNull: false },
  location: { type: DataTypes.STRING, allowNull: false },
  status: { type: DataTypes.STRING, defaultValue: "cekani" },

  customerId: { type: DataTypes.INTEGER, allowNull: false },
  helperId: { type: DataTypes.INTEGER, allowNull: true }, // 👈 NOVÉ
});

/* =========================
   RELATIONS
========================= */

User.hasMany(Job, { foreignKey: "customerId", as: "CreatedJobs" });
User.hasMany(Job, { foreignKey: "helperId", as: "TakenJobs" });

Job.belongsTo(User, { foreignKey: "customerId", as: "Customer" });
Job.belongsTo(User, { foreignKey: "helperId", as: "Helper" });

/* =========================
   HEALTH
========================= */

app.get("/", (req, res) => {
  res.json({ status: "API OK" });
});

/* =========================
   USERS
========================= */

app.post("/api/users/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashed,
      role,
    });

    res.json({ id: user.id, name: user.name, role: user.role });
  } catch (err) {
    res.status(500).json({ error: "Chyba registrace" });
  }
});

app.post("/api/users/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(401).json({ error: "Špatné údaje" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ error: "Špatné údaje" });

    res.json({ id: user.id, name: user.name, role: user.role });
  } catch {
    res.status(500).json({ error: "Chyba loginu" });
  }
});

/* =========================
   JOBS
========================= */

// vytvoření zakázky
app.post("/api/jobs", async (req, res) => {
  try {
    const job = await Job.create(req.body);
    res.json(job);
  } catch (err) {
    res.status(500).json({ error: "Chyba vytvoření zakázky" });
  }
});

// všechny zakázky
app.get("/api/jobs", async (req, res) => {
  const jobs = await Job.findAll();
  res.json(jobs);
});

// moje zakázky (zadavatel)
app.get("/api/jobs/my", async (req, res) => {
  const { customerId } = req.query;
  const jobs = await Job.findAll({ where: { customerId } });
  res.json(jobs);
});

// 🔥 ZHOTOVITEL SE PŘIHLÁSÍ K ZAKÁZCE
app.post("/api/jobs/:id/assign", async (req, res) => {
  try {
    const { helperId } = req.body;
    const job = await Job.findByPk(req.params.id);

    if (!job) {
      return res.status(404).json({ error: "Zakázka nenalezena" });
    }

    if (job.status !== "cekani") {
      return res.status(400).json({ error: "Zakázka už není dostupná" });
    }

    job.helperId = helperId;
    job.status = "domluveno";
    await job.save();

    res.json(job);
  } catch (err) {
    res.status(500).json({ error: "Chyba přiřazení zhotovitele" });
  }
});

/* =========================
   START
========================= */

const PORT = process.env.PORT || 5000;

sequelize.sync().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server běží na portu ${PORT}`);
  });
});
