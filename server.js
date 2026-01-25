require("dotenv").config();

const express = require("express");
const cors = require("cors");

const sequelize = require("./config/db");

const authRoutes = require("./routes/auth");
const usersRoutes = require("./routes/users");
const jobsRoutes = require("./routes/jobs");
const reviewsRoutes = require("./routes/reviews");

const app = express();

app.use(cors());
app.use(express.json());

// ROUTES
app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/jobs", jobsRoutes);
app.use("/api/reviews", reviewsRoutes);

// TEST ROUTE
app.get("/", (req, res) => {
  res.json({ status: "Pomi backend běží 🚀" });
});

// DB
sequelize
  .authenticate()
  .then(() => console.log("✅ Database connected"))
  .catch((err) => console.error("❌ Database error:", err));

sequelize.sync();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`✅ Server běží na portu ${PORT}`)
);

