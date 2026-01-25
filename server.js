import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import sequelize from "./config/db.js";

// ROUTES
import jobsRoutes from "./routes/jobs.js";
import chatRoutes from "./routes/chat.js";

dotenv.config();

const app = express();

// MIDDLEWARE
app.use(cors());
app.use(express.json());

// ROUTES
app.use("/api/jobs", jobsRoutes);
app.use("/api/chat", chatRoutes);

// TEST ROUTE
app.get("/", (req, res) => {
  res.send("Pomi backend běží 🚀");
});

// DB SYNC + SERVER START
const PORT = process.env.PORT || 5000;

sequelize
  .sync()
  .then(() => {
    console.log("📦 Databáze synchronizována");

    app.listen(PORT, () => {
      console.log(`🚀 Server běží na portu ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Chyba databáze:", err);
  });
