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
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM("zadavatel", "zhotovitel"),
    allowNull: false,
  },
});

const Job = sequelize.define("Job", {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  reward: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  timeFrom: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  timeTo: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  location: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: "cekani",
  },
});

const JobResponse = sequelize.define("JobResponse", {
  status: {
    type: DataTypes.ENUM("cekani", "domluveno", "zamítnuto"),
    defaultValue: "cekani",
  },
});

/* =========================
   RELATIONS
========================= */

User.hasMany(Job, { foreignKey: "customerId" });
Job.belongsTo(User, { foreignKey: "customerId" });

User.hasMany(JobResponse, { foreignKey: "workerId" });
JobResponse.belongsTo(User, { foreignKey: "workerId" });

Job.hasMany(JobResponse, { foreignKey: "jobId" });
JobResponse.belongsTo(Job, { foreignKey: "jobId" });

/* =========================
   AUTH MIDDLEWARE 🆕
========================= */

const requireUser = async (req, res, next) => {
  const userId = req.headers["x-user-id"];

  if (!userId) {
    return res.status(401).json({ error: "Nepřihlášený uživatel" });
  }

  const user = await User.findByPk(userId);
  if (!user) {
    return res.status(401).json({ error: "Uživatel neexistuje" });
  }

  req.user = user;
  next();
};

const requireRole = (role) => {
  return (req, res, next) => {
    if (req.user.role !== role) {
      return res.status(403).json({ error: "Nedostatečné oprávnění" });
    }
    next();
  };
};

/* =========================
   HEALTH CHECK
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

    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: "Chybí povinná pole" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
    });

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (err) {
    console.error("REGISTER ERROR:", err);
    res.status(500).json({ error: "Chyba serveru" });
  }
});

app.post("/api/users/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: "Neplatné údaje" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ error: "Neplatné údaje" });
    }

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ error: "Chyba serveru" });
  }
});

/* =========================
   JOBS
========================= */

// vytvoření zakázky – jen zadavatel
app.post(
  "/api/jobs",
  requireUser,
  requireRole("zadavatel"),
  async (req, res) => {
    try {
      const job = await Job.create({
        ...req.body,
        customerId: req.user.id,
      });
      res.json(job);
    } catch (err) {
      console.error("JOB CREATE ERROR:", err);
      res.status(500).json({ error: "Chyba vytvoření zakázky" });
    }
  }
);

app.get("/api/jobs", async (req, res) => {
  try {
    const jobs = await Job.findAll();
    res.json(jobs);
  } catch (err) {
    console.error("JOB GET ERROR:", err);
    res.status(500).json({ error: "Chyba serveru" });
  }
});

app.get("/api/jobs/my", requireUser, async (req, res) => {
  try {
    const jobs = await Job.findAll({
      where: { customerId: req.user.id },
    });

    res.json(jobs);
  } catch (err) {
    console.error("JOB MY ERROR:", err);
    res.status(500).json({ error: "Chyba serveru" });
  }
});

/* =========================
   JOB RESPONSES
========================= */

// zhotovitel reaguje
app.post(
  "/api/jobs/:jobId/respond",
  requireUser,
  requireRole("zhotovitel"),
  async (req, res) => {
    try {
      const { jobId } = req.params;

      const response = await JobResponse.create({
        jobId,
        workerId: req.user.id,
      });

      res.json(response);
    } catch (err) {
      console.error("JOB RESPONSE ERROR:", err);
      res.status(500).json({ error: "Chyba reakce" });
    }
  }
);

// zadavatel potvrzuje
app.post(
  "/api/jobs/:jobId/confirm",
  requireUser,
  requireRole("zadavatel"),
  async (req, res) => {
    try {
      const { jobId } = req.params;
      const { workerId } = req.body;

      const job = await Job.findByPk(jobId);
      if (!job || job.customerId !== req.user.id) {
        return res.status(403).json({ error: "Cizí zakázka" });
      }

      await JobResponse.update(
        { status: "zamítnuto" },
        { where: { jobId } }
      );

      await JobResponse.update(
        { status: "domluveno" },
        { where: { jobId, workerId } }
      );

      await Job.update(
        { status: "domluveno" },
        { where: { id: jobId } }
      );

      res.json({ success: true });
    } catch (err) {
      console.error("JOB CONFIRM ERROR:", err);
      res.status(500).json({ error: "Chyba potvrzení" });
    }
  }
);

// reakce na zakázku
app.get(
  "/api/jobs/:jobId/responses",
  requireUser,
  async (req, res) => {
    try {
      const { jobId } = req.params;

      const responses = await JobResponse.findAll({
        where: { jobId },
        include: [{ model: User, attributes: ["id", "name", "email"] }],
      });

      res.json(responses);
    } catch (err) {
      console.error("JOB RESPONSES GET ERROR:", err);
      res.status(500).json({ error: "Chyba serveru" });
    }
  }
);

/* =========================
   START SERVER
========================= */

const PORT = process.env.PORT || 5000;

sequelize.sync().then(() => {
  console.log("✅ DB synchronizována");
  app.listen(PORT, () => {
    console.log(`🚀 Server běží na portu ${PORT}`);
  });
});
