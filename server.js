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
  role: {
    type: DataTypes.ENUM("zadavatel", "zhotovitel"),
    allowNull: false,
  },
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
   AUTH
========================= */

const requireUser = async (req, res, next) => {
  const userId = req.headers["x-user-id"];
  if (!userId) return res.status(401).json({ error: "Nepřihlášený uživatel" });

  const user = await User.findByPk(userId);
  if (!user) return res.status(401).json({ error: "Uživatel neexistuje" });

  req.user = user;
  next();
};

const requireRole = (role) => (req, res, next) => {
  if (req.user.role !== role) {
    return res.status(403).json({ error: "Nedostatečné oprávnění" });
  }
  next();
};

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

    res.json({ id: user.id, name, email, role });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

/* =========================
   JOBS
========================= */

app.post(
  "/api/jobs",
  requireUser,
  requireRole("zadavatel"),
  async (req, res) => {
    try {
      const {
        title,
        category,
        description,
        reward,
        date,
        timeFrom,
        timeTo,
        location,
      } = req.body;

      if (
        !title ||
        !category ||
        !description ||
        !reward ||
        !date ||
        timeFrom === undefined ||
        timeTo === undefined ||
        !location
      ) {
        return res.status(400).json({
          error: "Chybí některé povinné pole zakázky",
        });
      }

      const job = await Job.create({
        title,
        category,
        description,
        reward,
        date,
        timeFrom,
        timeTo,
        location,
        customerId: req.user.id,
      });

      res.json(job);
    } catch (err) {
      console.error("JOB CREATE ERROR:", err);
      res.status(500).json({ error: err.message });
    }
  }
);

app.get("/api/jobs", async (req, res) => {
  const jobs = await Job.findAll();
  res.json(jobs);
});

app.get("/api/jobs/my", requireUser, async (req, res) => {
  const jobs = await Job.findAll({
    where: { customerId: req.user.id },
  });
  res.json(jobs);
});

/* =========================
   JOB RESPONSES
========================= */

app.post(
  "/api/jobs/:jobId/respond",
  requireUser,
  requireRole("zhotovitel"),
  async (req, res) => {
    const response = await JobResponse.create({
      jobId: req.params.jobId,
      workerId: req.user.id,
    });
    res.json(response);
  }
);

app.post(
  "/api/jobs/:jobId/confirm",
  requireUser,
  requireRole("zadavatel"),
  async (req, res) => {
    const { workerId } = req.body;
    const job = await Job.findByPk(req.params.jobId);

    if (!job || job.customerId !== req.user.id) {
      return res.status(403).json({ error: "Cizí zakázka" });
    }

    await JobResponse.update(
      { status: "zamítnuto" },
      { where: { jobId: job.id } }
    );

    await JobResponse.update(
      { status: "domluveno" },
      { where: { jobId: job.id, workerId } }
    );

    await Job.update(
      { status: "domluveno" },
      { where: { id: job.id } }
    );

    res.json({ success: true });
  }
);

app.get(
  "/api/jobs/:jobId/responses",
  requireUser,
  async (req, res) => {
    const responses = await JobResponse.findAll({
      where: { jobId: req.params.jobId },
      include: [{ model: User, attributes: ["id", "name", "email"] }],
    });
    res.json(responses);
  }
);

/* =========================
   START
========================= */

const PORT = process.env.PORT || 5000;

sequelize.sync().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server běží na portu ${PORT}`);
  });
});
