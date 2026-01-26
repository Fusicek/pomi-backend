const express = require("express");
const router = express.Router();

/**
 * DIAGNOSTIKA – test spojení
 */
router.post("/", async (req, res) => {
  console.log("🧪 TEST JOB REQUEST:", req.body);

  return res.status(200).json({
    message: "REQUEST DORAZIL",
    body: req.body,
  });
});

router.get("/", async (req, res) => {
  return res.json({ status: "GET OK" });
});

module.exports = router;

