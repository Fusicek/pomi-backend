const express = require("express");
const cors = require("cors");

const { sequelize } = require("./models");

// ROUTES
const authRoutes = require("./routes/auth");
const usersRoutes = require("./routes/users");
const jobsRoutes = require("./routes/jobs");
// ❌ chat zatím NEPOUŽÍVÁME – proto tu NENÍ

const app = express();

// ===== MIDDLEWARE =====
app.use(cors());
app.use(express.json());

// ===== ROUTES =====
app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/jobs", jobsRoutes);

// ===== HEALTH CHECK =====
app.get("/", (req, res) => {
  res.send("Pomi backend běží");
});

// ===== START SERVER =====
const PORT = process.env.PORT || 5000;

sequelize
  .sync({ alter: true }) // ⚠️ DŮLEŽITÉ – NESMAŽE DB, jen ji dorovná
  .then(() => {
    console.log("📦 Databáze synchronizována");
    app.listen(PORT, () => {
      console.log(`🚀 Server běží na portu ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Chyba databáze:", err);
  });


