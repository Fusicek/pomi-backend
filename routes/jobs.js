const express = require("express");
const router = express.Router();

// dočasně bez DB – jen test
router.get("/", (req, res) => {
  res.json([
    {
      id: 1,
      title: "Test zakázka",
      location: "Praha",
      status: "čeká na pomocníka"
    }
  ]);
});

module.exports = router;
