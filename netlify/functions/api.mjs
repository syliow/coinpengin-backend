import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import mongoose from 'mongoose';
import serverless from 'serverless-http';

// Create Express app
const app = express();

// MongoDB connection state management for serverless
let isConnected = false;

const connectDB = async () => {
  if (isConnected) {
    return;
  }

  const mongoUrl = process.env.MONGO_URL;
  if (!mongoUrl) {
    throw new Error('MONGO_URL is not defined in environment variables');
  }

  try {
    await mongoose.connect(mongoUrl);
    isConnected = true;
    console.log('MongoDB Connected');
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    throw error;
  }
};

// User Schema
const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, 'Please add a first name'],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, 'Please add a last name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, 'Please add a password'],
      minlength: [6, 'Password must be at least 6 characters'],
    },
    wishlist: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Get or create the User model
const User = mongoose.models.User || mongoose.model('User', userSchema);

// Import dependencies for controllers
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import axios from 'axios';

// Simple in-memory cache for serverless (per-invocation caching)
const cache = new Map();
const CACHE_TTL = {
  MARKET_DATA: 120000,   // 2 minutes in ms
  HISTORICAL: 900000,    // 15 minutes in ms
  COIN_DETAILS: 600000   // 10 minutes in ms
};

const getFromCache = (key) => {
  const item = cache.get(key);
  if (!item) return null;
  if (Date.now() > item.expiry) {
    cache.delete(key);
    return null;
  }
  return item.data;
};

const setInCache = (key, data, ttl) => {
  cache.set(key, { data, expiry: Date.now() + ttl });
};

// CoinGecko Service
const IS_PRO = process.env.COINGECKO_IS_PRO === 'true';
const API_KEY = process.env.COINGECKO_API_KEY || '';
const COINGECKO_BASE_URL = IS_PRO
  ? 'https://pro-api.coingecko.com/api/v3'
  : 'https://api.coingecko.com/api/v3';
const AUTH_HEADER_NAME = IS_PRO ? 'x-cg-pro-api-key' : 'x-cg-demo-api-key';

const getAxiosConfig = (params = {}) => {
  const config = { params };
  if (API_KEY) {
    config.headers = { [AUTH_HEADER_NAME]: API_KEY };
  }
  return config;
};

const coingeckoService = {
  getMarketData: async (currency = 'usd', perPage = 100, page = 1) => {
    const cacheKey = `market_${currency}_${perPage}_${page}`;
    const cachedData = getFromCache(cacheKey);
    if (cachedData) return cachedData;

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
    setInCache(cacheKey, response.data, CACHE_TTL.MARKET_DATA);
    return response.data;
  },

  getHistoricalChart: async (coinId, currency = 'usd', days = 365) => {
    const cacheKey = `chart_${coinId}_${currency}_${days}`;
    const cachedData = getFromCache(cacheKey);
    if (cachedData) return cachedData;

    const url = `${COINGECKO_BASE_URL}/coins/${coinId}/market_chart`;
    const params = {
      vs_currency: currency.toLowerCase(),
      days: days
    };

    const response = await axios.get(url, getAxiosConfig(params));
    setInCache(cacheKey, response.data, CACHE_TTL.HISTORICAL);
    return response.data;
  },

  getCoinDetails: async (coinId) => {
    const cacheKey = `coin_${coinId}`;
    const cachedData = getFromCache(cacheKey);
    if (cachedData) return cachedData;

    const url = `${COINGECKO_BASE_URL}/coins/${coinId}`;
    const params = {
      localization: false,
      tickers: false,
      market_data: true,
      community_data: false,
      developer_data: false
    };

    const response = await axios.get(url, getAxiosConfig(params));
    setInCache(cacheKey, response.data, CACHE_TTL.COIN_DETAILS);
    return response.data;
  }
};

// JWT Token Generation
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// Auth Middleware
const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'You are not logged in!' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// Async handler wrapper
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));

// Compression middleware
app.use(compression());

// CORS middleware
app.use(cors());

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Connect to DB before handling requests
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    res.status(500).json({ message: 'Database connection failed' });
  }
});

// Welcome route
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Welcome to CoinPengin Backend Server',
    version: '2.0.0',
    status: 'running',
    platform: 'Netlify Functions'
  });
});

app.get('/welcome', (req, res) => {
  res.status(200).json({
    message: 'Welcome to CoinPengin Backend Server',
    version: '2.0.0',
    status: 'running',
    platform: 'Netlify Functions'
  });
});

// User Routes
app.post('/api/users/register', asyncHandler(async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  if (!firstName || !lastName || !email || !password) {
    return res.status(400).json({ message: 'Please enter all required fields' });
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    return res.status(400).json({ message: 'User already exists' });
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = await User.create({
    firstName,
    lastName,
    email,
    password: hashedPassword,
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      token: generateToken(user._id),
    });
  } else {
    res.status(400).json({ message: 'Invalid user data' });
  }
}));

app.post('/api/users/login', asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Please enter all fields' });
  }

  const user = await User.findOne({ email });

  if (user && (await bcrypt.compare(password, user.password))) {
    res.json({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      token: generateToken(user._id),
    });
  } else {
    res.status(401).json({ message: 'Invalid email or password' });
  }
}));

app.get('/api/users/get', protect, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  let wishlistData = [];

  if (user.wishlist && user.wishlist.length > 0) {
    try {
      const coinData = await coingeckoService.getMarketData('usd', 250, 1);
      wishlistData = coinData.filter((coin) => user.wishlist.includes(coin.name));
    } catch (error) {
      console.error('Error fetching CoinGecko data:', error.message);
    }
  }

  res.status(200).json({
    id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    wishlist: wishlistData,
  });
}));

app.post('/api/users/wishlist', protect, asyncHandler(async (req, res) => {
  const { coin, user_email } = req.body;

  if (!coin || !user_email) {
    return res.status(400).json({ message: 'Please provide coin and user email' });
  }

  const user = await User.findOne({ email: user_email });

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  const coinExists = user.wishlist?.includes(coin);

  if (!coinExists) {
    user.wishlist.push(coin);
    await user.save();
    res.status(200).json({
      message: `${coin} added to wishlist`,
      wishlist: user.wishlist,
    });
  } else {
    user.wishlist = user.wishlist.filter((c) => c !== coin);
    await user.save();
    res.status(200).json({
      message: `${coin} removed from wishlist`,
      wishlist: user.wishlist,
    });
  }
}));

// Coin Routes
app.get('/api/coins/markets', asyncHandler(async (req, res) => {
  const { currency, perPage, page } = req.query;
  const data = await coingeckoService.getMarketData(
    currency,
    perPage ? parseInt(perPage) : 100,
    page ? parseInt(page) : 1
  );
  res.json(data);
}));

app.get('/api/coins/:id/chart', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { currency, days } = req.query;
  const data = await coingeckoService.getHistoricalChart(
    id,
    currency,
    days ? parseInt(days) : 365
  );
  res.json(data);
}));

app.get('/api/coins/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const data = await coingeckoService.getCoinDetails(id);
  res.json(data);
}));

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: `Not Found - ${req.originalUrl}` });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
  });
});

// Export the serverless handler
export const handler = serverless(app);

// Export config for Netlify Functions
export const config = {
  path: ['/', '/welcome', '/api/*']
};
