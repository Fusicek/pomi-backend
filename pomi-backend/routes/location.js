const express = require('express');
const router = express.Router();
const fetch = (...args) =>
  import('node-fetch').then(({ default: fetch }) => fetch(...args));

router.get('/search', async (req, res) => {
  const query = req.query.q;

  if (!query || query.length < 3) {
    return res.json([]);
  }

  try {
    const response = await fetch(
      `https://api.mapy.cz/v1/geocode?query=${encodeURIComponent(
        query
      )}&lang=cs&limit=5&apikey=${process.env.MAPY_API_KEY}`
    );

    const data = await response.json();

    const results =
      data?.items?.map((item) => ({
        name: item.name,
        lat: item.position.lat,
        lng: item.position.lon,
      })) || [];

    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json([]);
  }
});

module.exports = router;
