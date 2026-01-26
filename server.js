require("dotenv").config();
const express = require("express");
const { sequelize } = require("./models");

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ status: "API OK" });
});

sequelize
  .sync({ alter: true })
  .then(() => {
    console.log("✅ DB synchronizována");
    app.listen(5000, () =>
      console.log("🚀 Server běží na portu 5000")
    );
  })
  .catch((err) => {
    console.error("❌ DB chyba:", err);
  });
