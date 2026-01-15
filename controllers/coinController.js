const asyncHandler = require('express-async-handler');
const coingeckoService = require('../services/coingeckoService');

/**
 * @desc    Get market data for coins
 * @route   GET /api/coins/markets
 * @access  Public
 */
const getMarketData = asyncHandler(async (req, res) => {
  const { currency, perPage, page } = req.query;
  const data = await coingeckoService.getMarketData(
    currency,
    perPage ? parseInt(perPage) : 100,
    page ? parseInt(page) : 1
  );
  res.json(data);
});

/**
 * @desc    Get historical chart data for a coin
 * @route   GET /api/coins/:id/chart
 * @access  Public
 */
const getHistoricalChart = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { currency, days } = req.query;
  const data = await coingeckoService.getHistoricalChart(
    id,
    currency,
    days ? parseInt(days) : 365
  );
  res.json(data);
});

/**
 * @desc    Get detailed information about a coin
 * @route   GET /api/coins/:id
 * @access  Public
 */
const getCoinDetails = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const data = await coingeckoService.getCoinDetails(id);
  res.json(data);
});

module.exports = {
  getMarketData,
  getHistoricalChart,
  getCoinDetails
};
