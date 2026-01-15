const express = require('express');
const router = express.Router();
const { 
  getMarketData, 
  getHistoricalChart, 
  getCoinDetails 
} = require('../controllers/coinController');

// Coin data routes
router.get('/markets', getMarketData);
router.get('/:id/chart', getHistoricalChart);
router.get('/:id', getCoinDetails);

module.exports = router;
