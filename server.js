require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

// ROUTES
app.use('/api/jobs', require('./routes/jobs'));
app.use('/api/location', require('./routes/location'));

// TEST
app.get('/', (req, res) => {
  res.send('Pomi backend běží');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server běží na portu ${PORT}`);
});



