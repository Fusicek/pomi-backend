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
   JOB DETAIL (JEDINÝ ZDROJ PRAVDY)
========================= */

app.get("/api/jobs/:jobId/detail", requireUser, async (req, res) => {
  const job = await Job.findByPk(req.params.jobId, {
    include: [
      { model: JobResponse, include: [{ model: User, attributes: ["id", "name"] }] },
      { model: JobRating },
    ],
  });

  if (!job) return res.status(404).json({ error: "Zakázka neexistuje" });

  if (req.user.role === "zhotovitel") {
    const myResponse = job.JobResponses.find(
      (r) => r.workerId === req.user.id
    );

    return res.json({
      id: job.id,
      title: job.title,
      description: job.description,
      reward: job.reward,
      status: job.status,
      myResponseStatus: myResponse?.status || null,
      canRespond: job.status === "cekani" && !myResponse,
      rating: job.JobRating?.rating || null,
    });
  }

  if (job.customerId !== req.user.id) {
    return res.status(403).json({ error: "Cizí zakázka" });
  }

  const confirmed = job.JobResponses.find((r) => r.status === "domluveno");

  res.json({
    id: job.id,
    title: job.title,
    description: job.description,
    reward: job.reward,
    status: job.status,
    responses: job.JobResponses.map((r) => ({
      id: r.id,
      status: r.status,
      worker: { id: r.User.id, name: r.User.name },
    })),
    selectedWorker: confirmed
      ? { id: confirmed.User.id, name: confirmed.User.name }
      : null,
    canConfirm: job.status === "cekani",
    canFinish: job.status === "domluveno",
    canRate: job.status === "hotovo" && !job.JobRating,
  });
});

/* =========================
   AKCE
========================= */

app.post("/api/jobs/:jobId/respond", requireUser, requireRole("zhotovitel"), async (req, res) => {
  const job = await Job.findByPk(req.params.jobId);
  if (!job || job.status !== "cekani") {
    return res.status(400).json({ error: "Nelze reagovat" });
  }

  const existing = await JobResponse.findOne({
    where: { jobId: job.id, workerId: req.user.id },
  });

  if (existing) {
    return res.status(400).json({ error: "Už jste reagoval" });
  }

  const response = await JobResponse.create({
    jobId: job.id,
    workerId: req.user.id,
  });

  res.json(response);
});

app.post("/api/jobs/:jobId/confirm", requireUser, requireRole("zadavatel"), async (req, res) => {
  const { workerId } = req.body;
  const job = await Job.findByPk(req.params.jobId);

  if (!job || job.customerId !== req.user.id || job.status !== "cekani") {
    return res.status(400).json({ error: "Nelze potvrdit" });
  }

  await JobResponse.update({ status: "zamítnuto" }, { where: { jobId: job.id } });
  await JobResponse.update(
    { status: "domluveno" },
    { where: { jobId: job.id, workerId } }
  );

  await job.update({ status: "domluveno" });
  res.json({ success: true });
});

app.post("/api/jobs/:jobId/finish", requireUser, requireRole("zadavatel"), async (req, res) => {
  const job = await Job.findByPk(req.params.jobId);
  if (!job || job.customerId !== req.user.id || job.status !== "domluveno") {
    return res.status(400).json({ error: "Nelze ukončit" });
  }

  await job.update({ status: "hotovo" });
  res.json({ success: true });
});

app.post("/api/jobs/:jobId/rate", requireUser, requireRole("zadavatel"), async (req, res) => {
  const { rating, comment } = req.body;
  const job = await Job.findByPk(req.params.jobId);

  if (!job || job.status !== "hotovo") {
    return res.status(400).json({ error: "Nelze hodnotit" });
  }

  const response = await JobResponse.findOne({
    where: { jobId: job.id, status: "domluveno" },
  });

  const existing = await JobRating.findOne({ where: { jobId: job.id } });
  if (existing) return res.status(400).json({ error: "Už hodnoceno" });

  const jobRating = await JobRating.create({
    jobId: job.id,
    customerId: req.user.id,
    workerId: response.workerId,
    rating,
    comment,
  });

  res.json(jobRating);
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
