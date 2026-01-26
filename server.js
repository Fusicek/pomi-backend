require("dotenv").config();
const express = require("express");
const cors = require("cors");

const sequelize = require("./config/db");

const authRoutes = require("./routes/auth");
const usersRoutes = require("./routes/users");
const jobsRoutes = require("./routes/jobs");
const chatsRoutes = require("./routes/chats");
const reviewsRoutes = require("./routes/reviews");

const app = express();

app.use(cors());
app.use(express.json());

// ROUTES
app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/jobs", jobsRoutes);
app.use("/api/chats", chatsRoutes);
app.use("/api/reviews", reviewsRoutes);

// DB SYNC – 🔴 TOHLE JE KLÍČOVÉ
(async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected");

    await sequelize.sync({ alter: true });
    console.log("✅ Database synced (alter)");

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () =>
      console.log(`🚀 Server běží na portu ${PORT}`)
    );
  } catch (err) {
    console.error("❌ DB error:", err);
  }
})();


