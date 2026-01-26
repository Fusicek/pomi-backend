require("dotenv").config();
const express = require("express");
const cors = require("cors");

const { sequelize } = require("./models");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ status: "API OK" });
});

const PORT = process.env.PORT || 5000;

(async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ DB připojena");

    await sequelize.sync(); // ⬅️ TADY SE VYTVÁŘÍ TABULKY
    console.log("✅ Tabulky synchronizovány");

    app.listen(PORT, () => {
      console.log(`🚀 Server běží na portu ${PORT}`);
    });
  } catch (err) {
    console.error("❌ Chyba při startu:", err);
  }
})();
