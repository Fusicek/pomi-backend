require("dotenv").config();
const express = require("express");
const cors = require("cors");

const { sequelize } = require("./models");

const usersRoutes = require("./routes/users");
const jobsRoutes = require("./routes/jobs");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/users", usersRoutes);
app.use("/api/jobs", jobsRoutes);

app.get("/", (req, res) => {
  res.send("Pomi backend běží");
});

sequelize
  .sync({ alter: true })
  .then(() => {
    console.log("✅ DB synchronizována");
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () =>
      console.log(`🚀 Server běží na portu ${PORT}`)
    );
  })
  .catch((err) => {
    console.error("❌ DB chyba:", err);
  });

