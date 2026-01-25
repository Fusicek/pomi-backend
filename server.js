require("dotenv").config();
const express = require("express");
const cors = require("cors");
const sequelize = require("./config/db");

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

/**
 * ❗ TOTO JE KLÍČ ❗
 * force: true smaže ENUMy i tabulky
 */
sequelize
  .sync({ force: true })
  .then(() => {
    console.log("✅ DB kompletně znovu vytvořena");
  })
  .catch((err) => {
    console.error("❌ DB chyba:", err);
  });

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server běží na portu ${PORT}`);
});
