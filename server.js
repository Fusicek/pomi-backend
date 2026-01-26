const express = require("express");
const cors = require("cors");
const { sequelize } = require("./models");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ status: "API OK" });
});

app.get("/api/jobs", async (req, res) => {
  res.json({ status: "GET OK" });
});

(async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync(); // 🔥 vytvoří tabulky, NESMAŽE data
    console.log("✅ DB připojena");

    app.listen(5000, () => {
      console.log("🚀 Server běží na portu 5000");
    });
  } catch (err) {
    console.error("❌ Chyba DB:", err);
  }
})();
