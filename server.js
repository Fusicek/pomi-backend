require("dotenv").config();

const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");

const sequelize = require("./db");
const User = require("./models/User")(sequelize);

const app = express();

app.use(cors());
app.use(express.json());

/* ===== TEST ===== */
app.get("/", (req, res) => {
  res.json({ status: "API běží" });
});

/* ===== REGISTRACE ===== */
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
      role
    });

    res.json({
      message: "Uživatel vytvořen",
      id: user.id
    });
  } catch (err) {
    console.error("❌ REGISTER ERROR:", err);
    res.status(500).json({ error: "Chyba serveru" });
  }
});

/* ===== START ===== */
const PORT = process.env.PORT || 5000;

sequelize
  .sync({ alter: true }) // ⬅️ TOTO JE DŮLEŽITÉ
  .then(() => {
    console.log("✅ DB synchronizována");
    app.listen(PORT, () => {
      console.log(`🚀 Server běží na portu ${PORT}`);
    });
  })
  .catch(err => {
    console.error("❌ DB chyba:", err);
  });
