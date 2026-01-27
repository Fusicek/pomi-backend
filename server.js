const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");

const { sequelize, User } = require("./models");

const app = express();
app.use(cors());
app.use(express.json());

// 🔌 DB + sync
(async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ DB připojena");

    await sequelize.sync({ alter: true });
    console.log("✅ Modely synchronizovány");
  } catch (err) {
    console.error("❌ DB chyba:", err);
  }
})();

// 🟢 healthcheck
app.get("/", (req, res) => {
  res.json({ status: "API OK" });
});

// 🧑‍💻 registrace uživatele
app.post("/api/users/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: "Chybí povinná pole" });
    }

    if (!["zadavatel", "zhotovitel"].includes(role)) {
      return res.status(400).json({ error: "Neplatná role" });
    }

    const exists = await User.findOne({ where: { email } });
    if (exists) {
      return res.status(400).json({ error: "Email již existuje" });
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

// 🚀 start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server běží na portu ${PORT}`)
);
