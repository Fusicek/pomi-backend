import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import sequelize from "./config/db.js";

import authRoutes from "./routes/auth.js";
import jobsRoutes from "./routes/jobs.js";
import chatRoutes from "./routes/chat.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobsRoutes);
app.use("/api/chat", chatRoutes);

app.get("/", (req, res) => res.send("Pomi backend běží 🚀"));

sequelize.sync().then(() => {
  app.listen(process.env.PORT || 5000);
});

