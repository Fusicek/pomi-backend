require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// test endpoint
app.get("/", (req, res) => {
  res.json({ status: "OK", message: "Backend běží" });
});

// ROUTES
app.use("/api/jobs", require("./routes/jobs"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log("Backend běží na portu", PORT);
});
