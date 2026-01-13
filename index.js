const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const pool = require('./db'); 

const app = express();

app.use(morgan('dev'));
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('BidRush API is running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});