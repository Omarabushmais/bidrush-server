const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require("path");
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const auctionRoutes = require('./routes/auctions');

const app = express();

app.use(morgan('dev'));
app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/auctions', auctionRoutes);

app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));

app.get('/', (req, res) => {
  res.send('BidRush API is running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});