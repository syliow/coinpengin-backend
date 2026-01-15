const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const coingeckoService = require('../services/coingeckoService');

/**
 * @desc    Register a new user
 * @route   POST /api/users/register
 * @access  Public
 */
const registerUser = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  // Validate input
  if (!firstName || !lastName || !email || !password) {
    res.status(400);
    throw new Error('Please enter all required fields');
  }

  // Check if user already exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Create user
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
    res.status(400);
    throw new Error('Invalid user data');
  }
});

/**
 * @desc    Sign in a user
 * @route   POST /api/users/login
 * @access  Public
 */
const signinUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    res.status(400);
    throw new Error('Please enter all fields');
  }

  // Find user by email
  const user = await User.findOne({ email });

  // Check user and password
  if (user && (await bcrypt.compare(password, user.password))) {
    res.json({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      token: generateToken(user._id),
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

/**
 * @desc    Get user data with wishlist
 * @route   GET /api/users/get
 * @access  Private
 */
const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  let wishlistData = [];

  // If user has coins in wishlist, fetch their current data from CoinGecko
  if (user.wishlist && user.wishlist.length > 0) {
    try {
      // Fetch market data using the service (which includes caching)
      const coinData = await coingeckoService.getMarketData('usd', 250, 1);
      
      // Match wishlist coins with current market data
      wishlistData = coinData.filter((coin) => 
        user.wishlist.includes(coin.name)
      );
    } catch (error) {
      console.error('Error fetching CoinGecko data:', error.message);
      // Don't fail the whole request if CoinGecko is down
      // Return user data without wishlist details
    }
  }

  res.status(200).json({
    id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    wishlist: wishlistData,
  });
});

/**
 * @desc    Add or remove coin from wishlist
 * @route   POST /api/users/wishlist
 * @access  Private (should be authenticated)
 */
const addCoinToWishlist = asyncHandler(async (req, res) => {
  const { coin, user_email } = req.body;

  // Validate input
  if (!coin || !user_email) {
    res.status(400);
    throw new Error('Please provide coin and user email');
  }

  // Find user
  const user = await User.findOne({ email: user_email });

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Check if coin already exists in wishlist
  const coinExists = user.wishlist?.includes(coin);

  if (!coinExists) {
    // Add coin to wishlist
    user.wishlist.push(coin);
    await user.save();
    
    res.status(200).json({
      message: `${coin} added to wishlist`,
      wishlist: user.wishlist,
    });
  } else {
    // Remove coin from wishlist
    user.wishlist = user.wishlist.filter((c) => c !== coin);
    await user.save();
    
    res.status(200).json({
      message: `${coin} removed from wishlist`,
      wishlist: user.wishlist,
    });
  }
});

/**
 * Generate JWT token
 * @param {string} id - User ID
 * @returns {string} JWT token
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d', // Extended token lifetime
  });
};

module.exports = {
  registerUser,
  signinUser,
  getUser,
  addCoinToWishlist,
};
