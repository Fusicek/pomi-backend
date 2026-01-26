require("dotenv").config();
const express = require("express");
const cors = require("cors");

const { sequelize } = require("./models");

const jobsRoutes = require("./routes/jobs");
const usersRoutes = require("./routes/users");
const chatsRoutes = require("./routes/chats");

const app = express();

/* ===== MIDDLEWARE ===== */
app.use(cors({
  origin: "*",
}));
app.use(express.json());

/* ===== ROUTES ===== */
app.get("/", (req, res) => {
  res.json({ status: "API running" });
});

app.use("/api/jobs", jobsRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/chats", chatsRoutes);

/* ===== DB SYNC =====
⚠️ NESMAŽE DATA
jen dorovnává sloupce
*/
sequelize
  .sync({ alter: true })
  .then(() => {
    console.log("✅ DB synchronizována");
  })
  .catch((err) => {
    console.error("❌ DB chyba:", err);
  });

/* ===== SERVER ===== */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server běží na portu ${PORT}`);
});


