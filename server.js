const express = require("express");
const cors = require("cors");
const { sequelize } = require("./models");

const usersRoutes = require("./routes/users");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ status: "API OK" });
});

app.use("/api/users", usersRoutes);

(async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    console.log("✅ DB připojena");

    app.listen(5000, () => {
      console.log("🚀 Server běží na portu 5000");
    });
  } catch (err) {
    console.error("❌ Chyba DB:", err);
  }
})();
