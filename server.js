require("dotenv").config();

const express = require("express");
const cors = require("cors");
const sequelize = require("./config/db");

const app = express();

app.use(cors());
app.use(express.json());

// ROUTES
app.use("/api/users", require("./routes/users"));
app.use("/api/jobs", require("./routes/jobs"));

// TEST
app.get("/", (req, res) => {
  res.json({ status: "Backend běží" });
});

sequelize.sync().then(() => {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log("Server běží na portu", PORT);
  });
});
