require("dotenv").config();
const express = require("express");
const cors = require("cors");

const sequelize = require("./config/db");

// ROUTES
const usersRoutes = require("./routes/users");
const jobsRoutes = require("./routes/jobs");

const app = express();

app.use(cors());
app.use(express.json());

// API ROUTES
app.use("/api/users", usersRoutes);
app.use("/api/jobs", jobsRoutes);

// HEALTH CHECK
app.get("/", (req, res) => {
  res.send("Pomi backend běží ✅");
});

// ✅ BEZPEČNÁ SYNCHRONIZACE
// - nemaže DB
// - nepřepisuje ENUMy
// - jen ověří strukturu
sequelize
  .sync()
  .then(() => {
    console.log("✅ DB připojena a připravena");
  })
  .catch((err) => {
    console.error("❌ DB chyba:", err);
  });

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server běží na portu ${PORT}`);
});
