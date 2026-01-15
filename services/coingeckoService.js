const axios = require('axios');
const { cache } = require('../config/cache');

/**
 * CoinGecko API Service
 * Handles all interactions with the CoinGecko API v3 (Demo or Pro)
 * Implements caching to reduce API calls and respect rate limits
 */

// Configuration from environment
const IS_PRO = process.env.COINGECKO_IS_PRO === 'true';
const API_KEY = process.env.COINGECKO_API_KEY || '';

// Determine Base URL and Header Name
const COINGECKO_BASE_URL = IS_PRO 
  ? 'https://pro-api.coingecko.com/api/v3'
  : 'https://api.coingecko.com/api/v3';

const AUTH_HEADER_NAME = IS_PRO 
  ? 'x-cg-pro-api-key' 
  : 'x-cg-demo-api-key';

// Cache TTL values (in seconds)
const CACHE_TTL = {
  MARKET_DATA: 120,      // 2 minutes (up from 1m to save more calls)
  HISTORICAL: 900,      // 15 minutes (up from 5m for charts)
  COIN_DETAILS: 600     // 10 minutes (up from 3m)
};

/**
 * Creates authenticated axios instance or helper config
 */
const getAxiosConfig = (params = {}) => {
  const config = { params };
  if (API_KEY) {
    config.headers = {
      [AUTH_HEADER_NAME]: API_KEY
    };
  }
  return config;
};

/**
 * Fetch market data for cryptocurrencies
 */
const getMarketData = async (currency = 'usd', perPage = 100, page = 1) => {
  const cacheKey = `market_${currency}_${perPage}_${page}`;
  
  const cachedData = cache.get(cacheKey);
  if (cachedData) return cachedData;

  try {
    const url = `${COINGECKO_BASE_URL}/coins/markets`;
    const params = {
      vs_currency: currency.toLowerCase(),
      order: 'market_cap_desc',
      per_page: perPage,
      page: page,
      sparkline: false,
      include_24hr_vol: true
    };

    const response = await axios.get(url, getAxiosConfig(params));
    cache.set(cacheKey, response.data, CACHE_TTL.MARKET_DATA);
    return response.data;
  } catch (error) {
    console.error(`CoinGecko API Error (${COINGECKO_BASE_URL}):`, error.response?.data || error.message);
    throw error;
  }
};

/**
 * Fetch historical chart data for a specific coin
 */
const getHistoricalChart = async (coinId, currency = 'usd', days = 365) => {
  const cacheKey = `chart_${coinId}_${currency}_${days}`;
  
  const cachedData = cache.get(cacheKey);
  if (cachedData) return cachedData;

  try {
    const url = `${COINGECKO_BASE_URL}/coins/${coinId}/market_chart`;
    const params = {
      vs_currency: currency.toLowerCase(),
      days: days
    };

    const response = await axios.get(url, getAxiosConfig(params));
    cache.set(cacheKey, response.data, CACHE_TTL.HISTORICAL);
    return response.data;
  } catch (error) {
    console.error(`CoinGecko API Error (${COINGECKO_BASE_URL}):`, error.response?.data || error.message);
    throw error;
  }
};

/**
 * Fetch detailed information about a specific coin
 */
const getCoinDetails = async (coinId) => {
  const cacheKey = `coin_${coinId}`;
  
  const cachedData = cache.get(cacheKey);
  if (cachedData) return cachedData;

  try {
    const url = `${COINGECKO_BASE_URL}/coins/${coinId}`;
    const params = {
      localization: false,
      tickers: false,
      market_data: true,
      community_data: false,
      developer_data: false
    };

    const response = await axios.get(url, getAxiosConfig(params));
    cache.set(cacheKey, response.data, CACHE_TTL.COIN_DETAILS);
    return response.data;
  } catch (error) {
    console.error(`CoinGecko API Error (${COINGECKO_BASE_URL}):`, error.response?.data || error.message);
    throw error;
  }
};

module.exports = {
  getMarketData,
  getHistoricalChart,
  getCoinDetails
};
