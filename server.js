require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { Sequelize, DataTypes } = require("sequelize");
const bcrypt = require("bcryptjs");

const app = express();
app.use(cors());
app.use(express.json());

// =======================
// DB PŘIPOJENÍ (Railway)
// =======================
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  logging: false,
});

// =======================
// USER MODEL
// =======================
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

// =======================
// TEST ENDPOINT
// =======================
app.get("/", (req, res) => {
  res.json({ status: "API OK" });
});

// =======================
// REGISTER
// =======================
app.post("/api/users/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: "Chybí povinná pole" });
    }

    const exists = await User.findOne({ where: { email } });
    if (exists) {
      return res.status(400).json({ error: "Uživatel už existuje" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashed,
      role,
    });

    res.json({
      message: "Uživatel vytvořen",
      id: user.id,
    });
  } catch (err) {
    console.error("REGISTER ERROR:", err);
    res.status(500).json({ error: "Chyba serveru" });
  }
});

// =======================
// START SERVER + SYNC
// =======================
const PORT = process.env.PORT || 5000;

sequelize
  .authenticate()
  .then(() => {
    console.log("✅ DB připojena");
    return sequelize.sync(); // ⬅️ vytvoří tabulky
  })
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Server běží na portu ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ DB chyba:", err);
  });
