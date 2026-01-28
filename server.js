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

User.hasMany(JobRating, { foreignKey: "customerId", as: "givenRatings" });
User.hasMany(JobRating, { foreignKey: "workerId", as: "receivedRatings" });

JobRating.belongsTo(User, { foreignKey: "customerId", as: "customer" });
JobRating.belongsTo(User, { foreignKey: "workerId", as: "worker" });

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
   PROFILE + RATING
========================= */

app.get("/api/users/:id/profile", async (req, res) => {
  const user = await User.findByPk(req.params.id, {
    attributes: ["id", "name", "role"],
  });

  if (!user) {
    return res.status(404).json({ error: "Uživatel neexistuje" });
  }

  const stats = await JobRating.findAll({
    where: { workerId: user.id },
    attributes: [
      [sequelize.fn("AVG", sequelize.col("rating")), "avgRating"],
      [sequelize.fn("COUNT", sequelize.col("id")), "count"],
    ],
    raw: true,
  });

  res.json({
    ...user.toJSON(),
    rating: stats[0].avgRating
      ? Number(stats[0].avgRating).toFixed(2)
      : null,
    ratingCount: Number(stats[0].count),
  });
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
   AVAILABLE JOBS (ZHOTOVITEL)
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

    await JobResponse.update(
      { status: "zamítnuto" },
      { where: { jobId: job.id } }
    );

    await JobResponse.update(
      { status: "domluveno" },
      { where: { jobId: job.id, workerId } }
    );

    await job.update({ status: "domluveno" });
    res.json({ success: true });
  }
);

app.get(
  "/api/jobs/:jobId/responses",
  requireUser,
  requireRole("zadavatel"),
  async (req, res) => {
    const job = await Job.findByPk(req.params.jobId);
    if (!job || job.customerId !== req.user.id) {
      return res.status(403).json({ error: "Cizí zakázka" });
    }

    const responses = await JobResponse.findAll({
      where: { jobId: job.id },
      include: [{ model: User, attributes: ["id", "name", "email"] }],
    });

    res.json(responses);
  }
);

/* =========================
   🆕 DASHBOARD ZADAVATELE
========================= */

app.get(
  "/api/dashboard/customer",
  requireUser,
  requireRole("zadavatel"),
  async (req, res) => {
    const jobs = await Job.findAll({
      where: { customerId: req.user.id },
      include: [
        {
          model: JobResponse,
          include: [{ model: User, attributes: ["id", "name"] }],
        },
        {
          model: JobRating,
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    const data = jobs.map((job) => {
      const confirmed = job.JobResponses?.find(
        (r) => r.status === "domluveno"
      );

      return {
        id: job.id,
        title: job.title,
        status: job.status,
        responsesCount: job.JobResponses.length,
        selectedWorker: confirmed
          ? {
              id: confirmed.User.id,
              name: confirmed.User.name,
            }
          : null,
        canRate: job.status === "hotovo" && !job.JobRating,
      };
    });

    res.json(data);
  }
);

/* =========================
   FINISH + RATING
========================= */

app.post(
  "/api/jobs/:jobId/finish",
  requireUser,
  requireRole("zadavatel"),
  async (req, res) => {
    const job = await Job.findByPk(req.params.jobId);
    if (job.customerId !== req.user.id || job.status !== "domluveno") {
      return res.status(400).json({ error: "Nelze ukončit zakázku" });
    }

    await job.update({ status: "hotovo" });
    res.json({ success: true });
  }
);

app.post(
  "/api/jobs/:jobId/rate",
  requireUser,
  requireRole("zadavatel"),
  async (req, res) => {
    const { rating, comment } = req.body;
    const job = await Job.findByPk(req.params.jobId);

    const response = await JobResponse.findOne({
      where: { jobId: job.id, status: "domluveno" },
    });

    if (!response) {
      return res.status(400).json({ error: "Zakázka není domluvena" });
    }

    const existing = await JobRating.findOne({
      where: { jobId: job.id },
    });

    if (existing) {
      return res.status(400).json({ error: "Zakázka už byla hodnocena" });
    }

    const jobRating = await JobRating.create({
      jobId: job.id,
      customerId: req.user.id,
      workerId: response.workerId,
      rating,
      comment,
    });

    res.json(jobRating);
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
