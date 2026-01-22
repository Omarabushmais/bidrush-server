const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require("path");
const authRoutes = require('./routes/authRoutes');
const auctionRoutes = require('./routes/auctions');
const bidRoutes = require('./routes/bids');
require('dotenv').config();

const app = express();

const fs = require("fs");
const uploadDir = path.join(__dirname, "public", "uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

app.use(morgan('dev'));
app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/auctions', auctionRoutes);
app.use('/bids', bidRoutes);
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));

app.get('/', (req, res) => {
  res.send('BidRush API is running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});