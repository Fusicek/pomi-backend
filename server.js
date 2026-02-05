const express = require("express");
const { Sequelize, DataTypes } = require("sequelize");
const bcrypt = require("bcrypt");


const app = express();
app.use((req, res, next) => {
  const origin = req.headers.origin;

  const allowedOrigins = [
    "https://pomi.pro",
    "https://www.pomi.pro",
    "http://localhost:3000",
  ];

  if (allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
  }

  res.header("Access-Control-Allow-Credentials", "true");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, x-user-id"
  );
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});



/* ===== JSON parser ===== */
app.use(express.json());

/* =========================
   DATABASE
========================= */

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  protocol: "postgres",
  logging: false,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
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
  comment: DataTypes.TEXT,
});
const Notification = sequelize.define("Notification", {
  type: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  message: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  isRead: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
});


/* =========================
   RELATIONS
========================= */

User.hasMany(Job, { foreignKey: "customerId", as: "jobs" });
Job.belongsTo(User, { foreignKey: "customerId", as: "customer" });

User.hasMany(JobResponse, { foreignKey: "workerId" });
JobResponse.belongsTo(User, { foreignKey: "workerId", as: "worker" });

Job.hasMany(JobResponse, {
  foreignKey: "jobId",
  as: "responses", // ✅ KLÍČOVÝ ALIAS
});
JobResponse.belongsTo(Job, { foreignKey: "jobId" });

Job.hasOne(JobRating, { foreignKey: "jobId" });
JobRating.belongsTo(Job, { foreignKey: "jobId" });



/* =========================
   AUTH MIDDLEWARE
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
   AUTH – REGISTER
========================= */

app.post("/api/auth/register", async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: "Chybí údaje" });
  }

  const existing = await User.findOne({ where: { email } });
  if (existing) {
    return res.status(400).json({ error: "Uživatel už existuje" });
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
});

/* =========================
   AUTH – LOGIN
========================= */
app.post(
  "/api/profile",
  requireUser,
  requireRole("zhotovitel"),
  async (req, res) => {
    const { description } = req.body;

    if (!description || description.length < 20) {
      return res.status(400).json({
        error: "Popis musí mít alespoň 20 znaků",
      });
    }

    await req.user.update({
      description,
      profileCompleted: true,
    });

    res.json({ success: true });
  }
);
app.post("/api/auth/login", async (req, res) => {
  console.log("LOGIN BODY:", req.body);

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Chybí email nebo heslo" });
  }

  const user = await User.findOne({ where: { email } });

  if (!user) {
    return res.status(400).json({ error: "Neplatný email nebo heslo" });
  }

  const ok = await bcrypt.compare(password, user.password);

  if (!ok) {
    return res.status(400).json({ error: "Neplatný email nebo heslo" });
  }

  res.json({
    id: user.id,
    name: user.name,
    role: user.role,
  });
});

/* =========================
   GET CURRENT USER 🆕
========================= */

app.get("/api/me", requireUser, async (req, res) => {
  res.json({
    id: req.user.id,
    name: req.user.name,
    email: req.user.email,
    role: req.user.role,
  });
});



/* =========================
   CREATE JOB (ZADAVATEL)
========================= */

app.post(
  "/api/jobs",
  requireUser,
  requireRole("zadavatel"),
  async (req, res) => {
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
      timeFrom == null ||
      timeTo == null ||
      !location
    ) {
      return res.status(400).json({ error: "Chybí údaje" });
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
  }
);
/* =========================
   GET JOBS (LIST) 🆕 POUZE PŘIDÁNO
========================= */

app.get("/api/jobs", requireUser, async (req, res) => {
  // ZADAVATEL → vidí jen svoje zakázky
  if (req.user.role === "zadavatel") {
    const jobs = await Job.findAll({
      where: {
        customerId: req.user.id,
      },
      order: [["createdAt", "DESC"]],
    });

    return res.json(jobs);
  }

  // ZHOTOVITEL → vidí jen zakázky se stavem "cekani"
  if (req.user.role === "zhotovitel") {
    const jobs = await Job.findAll({
      where: {
        status: "cekani",
      },
      order: [["createdAt", "DESC"]],
    });

    return res.json(jobs);
  }

  res.status(403).json({ error: "Neznámá role" });
});


/* =========================
   JOB RESPOND (ZHOTOVITEL)
========================= */

app.post(
  "/api/jobs/:jobId/respond",
  requireUser,
  requireRole("zhotovitel"),
  async (req, res) => {

    if (!req.user.profileCompleted) {
      return res.status(403).json({
        error: "Nejprve vyplň svůj profil",
        code: "PROFILE_INCOMPLETE",
      });
    }

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

    await Notification.create({
      userId: job.customerId,
      type: "job_response",
      message: `Nová reakce na zakázku "${job.title}"`,
    });

    res.json(response);
  }
);


/* =========================
   JOB DETAIL (JEDINÝ ZDROJ PRAVDY)
========================= */

app.get("/api/jobs/:jobId/detail", requireUser, async (req, res) => {
  const job = await Job.findByPk(req.params.jobId, {
    include: [
      {
        model: JobResponse,
        as: "responses", // ⬅⬅⬅ KLÍČOVÉ
        include: [
          {
            model: User,
            as: "worker",
            attributes: ["id", "name"],
          },
        ],
      },
      {
        model: JobRating,
      },
    ],
  });

  if (!job) {
    return res.status(404).json({ error: "Zakázka neexistuje" });
  }

  // =========================
  // ZHOTOVITEL
  // =========================
  if (req.user.role === "zhotovitel") {
    const myResponse = job.responses.find(
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

  // =========================
  // ZADAVATEL – cizí zakázka
  // =========================
  if (job.customerId !== req.user.id) {
    return res.status(403).json({ error: "Cizí zakázka" });
  }

  // =========================
  // ZADAVATEL – DETAIL
  // =========================
  const confirmed = job.responses.find(
    (r) => r.status === "domluveno"
  );

  return res.json({
    id: job.id,
    title: job.title,
    description: job.description,
    reward: job.reward,
    status: job.status,
    responses: job.responses.map((r) => ({
      id: r.id,
      status: r.status,
      worker: {
        id: r.worker.id,
        name: r.worker.name,
      },
    })),
    selectedWorker: confirmed
      ? {
          id: confirmed.worker.id,
          name: confirmed.worker.name,
        }
      : null,
    canConfirm: job.status === "cekani",
    canFinish: job.status === "domluveno",
    canRate: job.status === "hotovo" && !job.JobRating,
  });
});


/* =========================
   CONFIRM JOB (ZADAVATEL)
========================= */

app.post(
  "/api/jobs/:jobId/confirm",
  requireUser,
  requireRole("zadavatel"),
  async (req, res) => {
    const { workerId } = req.body;

    if (!workerId) {
      return res.status(400).json({ error: "Chybí workerId" });
    }

    const job = await Job.findByPk(req.params.jobId);

    if (!job || job.customerId !== req.user.id) {
      return res.status(403).json({ error: "Cizí zakázka" });
    }

    if (job.status !== "cekani") {
      return res.status(400).json({ error: "Zakázku nelze potvrdit" });
    }

    const response = await JobResponse.findOne({
      where: { jobId: job.id, workerId },
    });

    if (!response) {
      return res.status(400).json({
        error: "Zhotovitel na zakázku nereagoval",
      });
    }

    await JobResponse.update(
      { status: "zamítnuto" },
      { where: { jobId: job.id } }
    );

    await response.update({ status: "domluveno" });
    await job.update({ status: "domluveno" });
     await Notification.create({
  userId: workerId,
  type: "job_confirmed",
  message: `Byl(a) jsi vybrán(a) na zakázku "${job.title}"`,
});


    res.json({ success: true });
  }
);

/* =========================
   FINISH JOB (ZADAVATEL) 🆕
========================= */

app.post(
  "/api/jobs/:jobId/finish",
  requireUser,
  requireRole("zadavatel"),
  async (req, res) => {
    const job = await Job.findByPk(req.params.jobId);

    if (!job || job.customerId !== req.user.id) {
      return res.status(403).json({ error: "Cizí zakázka" });
    }

    if (job.status !== "domluveno") {
      return res.status(400).json({ error: "Zakázku nelze ukončit" });
    }

    await job.update({ status: "hotovo" });
     const response = await JobResponse.findOne({
  where: { jobId: job.id, status: "domluveno" },
});

if (response) {
  await Notification.create({
    userId: response.workerId,
    type: "job_finished",
    message: `Zakázka "${job.title}" byla označena jako hotová`,
  });
}


    res.json({ success: true });
  }
);

/* =========================
   RATE JOB (ZADAVATEL) 🆕
========================= */

app.post(
  "/api/jobs/:jobId/rate",
  requireUser,
  requireRole("zadavatel"),
  async (req, res) => {
    const { rating, comment } = req.body;

    if (!rating) {
      return res.status(400).json({ error: "Chybí hodnocení" });
    }

    const job = await Job.findByPk(req.params.jobId);

    if (!job || job.customerId !== req.user.id) {
      return res.status(403).json({ error: "Cizí zakázka" });
    }

    if (job.status !== "hotovo") {
      return res.status(400).json({ error: "Zakázka není hotová" });
    }

    const existing = await JobRating.findOne({
      where: { jobId: job.id },
    });

    if (existing) {
      return res.status(400).json({ error: "Zakázka už byla hodnocena" });
    }

    const response = await JobResponse.findOne({
      where: { jobId: job.id, status: "domluveno" },
    });

    const jobRating = await JobRating.create({
      jobId: job.id,
      customerId: req.user.id,
      workerId: response.workerId,
      rating,
      comment,
    });
     await Notification.create({
  userId: response.workerId,
  type: "job_rated",
  message: `Zakázka "${job.title}" byla ohodnocena (${rating}/5)`,
});


    res.json(jobRating);
  }
);
app.get(
  "/api/dashboard/zadavatel",
  requireUser,
  requireRole("zadavatel"),
  async (req, res) => {
    const jobs = await Job.findAll({
      where: { customerId: req.user.id },
      include: [
        {
          model: JobResponse,
          as: "responses", // ✅ FIX
          attributes: ["id", "status"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    const grouped = { cekani: [], domluveno: [], hotovo: [] };

    for (const job of jobs) {
      grouped[job.status]?.push({
        id: job.id,
        title: job.title,
        category: job.category,
        reward: job.reward,
        date: job.date,
        location: job.location,
        responsesCount: job.responses.length, // ✅ FIX
      });
    }

    res.json({
      stats: {
        cekani: grouped.cekani.length,
        domluveno: grouped.domluveno.length,
        hotovo: grouped.hotovo.length,
        total: jobs.length,
      },
      jobs: grouped,
    });
  }
);

/* =========================
   DASHBOARD – ZHOTOVITEL 🆕
========================= */

app.get(
  "/api/dashboard/zhotovitel",
  requireUser,
  requireRole("zhotovitel"),
  async (req, res) => {
    const responses = await JobResponse.findAll({
      where: { workerId: req.user.id },
      include: [
        {
          model: Job,
          include: [
            {
              model: User,
              as: "customer", // ✅ FIX
              attributes: ["id", "name"],
            },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    const grouped = { cekani: [], domluveno: [], hotovo: [] };

    for (const r of responses) {
      const job = r.Job;

      grouped[job.status]?.push({
        jobId: job.id,
        title: job.title,
        reward: job.reward,
        date: job.date,
        location: job.location,
        jobStatus: job.status,
        myResponseStatus: r.status,
        customer: {
          id: job.customer.id,
          name: job.customer.name,
        },
      });
    }

    res.json({
      stats: {
        cekani: grouped.cekani.length,
        domluveno: grouped.domluveno.length,
        hotovo: grouped.hotovo.length,
        total: responses.length,
      },
      jobs: grouped,
    });
  }
);

/* =========================
   GET NOTIFICATIONS 🆕
========================= */

app.get("/api/notifications", requireUser, async (req, res) => {
  const notifications = await Notification.findAll({
    where: { userId: req.user.id },
    order: [["createdAt", "DESC"]],
  });

  res.json(notifications);
});
/* =========================
   GET UNREAD NOTIFICATIONS COUNT 🆕
========================= */

app.get(
  "/api/notifications/unread/count",
  requireUser,
  async (req, res) => {
    const count = await Notification.count({
      where: {
        userId: req.user.id,
        isRead: false,
      },
    });

    res.json({ unread: count });
  }
);

/* =========================
   MARK NOTIFICATION AS READ 🆕
========================= */

app.post(
  "/api/notifications/:id/read",
  requireUser,
  async (req, res) => {
    const notification = await Notification.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    if (!notification) {
      return res.status(404).json({ error: "Notifikace neexistuje" });
    }

    await notification.update({ isRead: true });

    res.json({ success: true });
  }
);
/* =========================
   MARK ALL NOTIFICATIONS AS READ 🆕
========================= */

app.post(
  "/api/notifications/read-all",
  requireUser,
  async (req, res) => {
    await Notification.update(
      { isRead: true },
      {
        where: {
          userId: req.user.id,
          isRead: false,
        },
      }
    );

    res.json({ success: true });
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







