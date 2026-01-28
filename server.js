const express = require("express");
const bodyParser = require("body-parser");
const { sequelize } = require("./models");

const jobsRoutes = require("./routes/jobs");

const app = express();
app.use(bodyParser.json());

// ROUTES
app.use("/api/jobs", jobsRoutes);

// TEST ROOT
app.get("/", (req, res) => {
  res.json({ status: "API OK" });
});

// DB + SERVER START
sequelize.sync()
  .then(() => {
    console.log("✅ DB synchronizována");
    app.listen(5000, () => {
      console.log("🚀 Server běží na portu 5000");
    });
  })
  .catch(err => {
    console.error("❌ DB chyba:", err);
  });
