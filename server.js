const express = require("express");
const { Sequelize, DataTypes, Op } = require("sequelize");
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

const JobRating = sequelize.define("JobRating", {
  rating: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: { min: 1, max: 5 },
  },
  comment: {
    type: DataTypes.TEXT,
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

Job.hasOne(JobRating, { foreignKey: "jobId" });
JobRating.belongsTo(Job, { foreignKey: "jobId" });

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
   USERS
========================= */

app.post("/api/users/register", async (req, res) => {
  const { name, email, password, role } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    role,
  });

  res.json({ id: user.id, name, email, role });
});

/* =========================
   JOBS
========================= */

app.post(
  "/api/jobs",
  requireUser,
  requireRole("zadavatel"),
  async (req, res) => {
    const job = await Job.create({
      ...req.body,
      customerId: req.user.id,
    });
    res.json(job);
  }
);

app.get("/api/jobs", async (req, res) => {
  res.json(await Job.findAll());
});

/* =========================
   AVAILABLE JOBS
========================= */

app.get(
  "/api/jobs/available",
  requireUser,
  requireRole("zhotovitel"),
  async (req, res) => {
    const responded = await JobResponse.findAll({
      where: { workerId: req.user.id },
      attributes: ["jobId"],
    });

    const ids = responded.map((r) => r.jobId);

    const jobs = await Job.findAll({
      where: {
        status: "cekani",
        id: { [Op.notIn]: ids.length ? ids : [0] },
      },
    });

    res.json(jobs);
  }
);

/* =========================
   JOB RESPONSES
========================= */

app.post(
  "/api/jobs/:jobId/respond",
  requireUser,
  requireRole("zhotovitel"),
  async (req, res) => {
    const existing = await JobResponse.findOne({
      where: {
        jobId: req.params.jobId,
        workerId: req.user.id,
      },
    });

    if (existing) {
      return res
        .status(400)
        .json({ error: "Na tuto zakázku už jste reagoval" });
    }

    const response = await JobResponse.create({
      jobId: req.params.jobId,
      workerId: req.user.id,
    });

    res.json(response);
  }
);

/* =========================
   ✅ DASHBOARD ZHOTOVITELE – FIX DUPLICIT
========================= */

app.get(
  "/api/dashboard/worker",
  requireUser,
  requireRole("zhotovitel"),
  async (req, res) => {
    const jobs = await Job.findAll({
      include: [
        {
          model: JobResponse,
          where: { workerId: req.user.id },
          required: true,
        },
        {
          model: JobRating,
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    const data = jobs.map((job) => {
      const myResponse = job.JobResponses[0];

      return {
        id: job.id,
        title: job.title,
        status: job.status,
        myResponseStatus: myResponse.status,
        rating: job.JobRating ? job.JobRating.rating : null,
      };
    });

    res.json(data);
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
