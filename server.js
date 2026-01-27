require("dotenv").config();
const express = require("express");
const { Sequelize, DataTypes } = require("sequelize");

const app = express();
app.use(express.json());

// ===================
// DB
// ===================
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  logging: false,
});

// ===================
// MODELS
// ===================
const User = sequelize.define("User", {
  name: DataTypes.STRING,
  email: { type: DataTypes.STRING, unique: true },
  password: DataTypes.STRING,
  role: DataTypes.STRING, // zadavatel | zhotovitel
});

const Job = sequelize.define("Job", {
  title: DataTypes.STRING,
  category: { type: DataTypes.STRING, allowNull: false },
  description: DataTypes.TEXT,
  reward: DataTypes.STRING,
  date: DataTypes.STRING,
  timeFrom: DataTypes.STRING,
  timeTo: DataTypes.STRING,
  location: DataTypes.STRING,
  status: DataTypes.STRING, // cekani | domluveno | hotovo
});

// ===================
// RELATIONS
// ===================
User.hasMany(Job, { foreignKey: "customerId" });
Job.belongsTo(User, { foreignKey: "customerId" });

// ===================
// ROUTES
// ===================

// test
app.get("/", (req, res) => {
  res.json({ status: "API OK" });
});

// seznam zakázek pro zhotovitele
app.get("/api/jobs", async (req, res) => {
  try {
    const jobs = await Job.findAll({
      where: { status: "cekani" },
      include: {
        model: User,
        attributes: ["id", "name", "email"],
      },
      order: [["createdAt", "DESC"]],
    });

    res.json(jobs);
  } catch (err) {
    console.error("GET JOBS ERROR:", err);
    res.status(500).json({ error: "Chyba serveru" });
  }
});

// ===================
// START
// ===================
sequelize.sync().then(() => {
  console.log("✅ DB synchronizována");
  app.listen(5000, () => {
    console.log("🚀 Server běží na portu 5000");
  });
});
