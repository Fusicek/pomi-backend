require("dotenv").config();
const express = require("express");
const cors = require("cors");

const sequelize = require("./config/db");

const authRoutes = require("./routes/auth");
const usersRoutes = require("./routes/users");
const jobsRoutes = require("./routes/jobs");

const app = express();

app.use(cors());
app.use(express.json());

// ROUTES
app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/jobs", jobsRoutes);

// TEST ROUTE
app.get("/", (req, res) => {
  res.send("Pomi backend běží");
});

// !!! DŮLEŽITÉ !!!
sequelize
  .sync({ alter: true })
  .then(() => {
    console.log("✅ Databáze synchronizována");
  })
  .catch((err) => {
    console.error("❌ Chyba DB:", err);
  });

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server běží na portu ${PORT}`);
});
