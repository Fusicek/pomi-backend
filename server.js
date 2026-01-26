const express = require("express");

const app = express();
const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.json({
    ok: true,
    message: "Pomi backend běží"
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server běží na portu ${PORT}`);
});
