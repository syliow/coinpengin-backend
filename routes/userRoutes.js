const express = require('express');
const router = express.Router();
const {
  registerUser,
  signinUser,
  getUser,
  addCoinToWishlist,
} = require('../controllers/userController');

const { protect } = require('../middleware/authMiddleware');
const { authLimiter } = require('../middleware/rateLimiter');

/**
 * @route   POST /api/users/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', authLimiter, registerUser);

/**
 * @route   POST /api/users/login
 * @desc    Sign in a user
 * @access  Public
 */
router.post('/login', authLimiter, signinUser);

/**
 * @route   GET /api/users/get
 * @desc    Get user data with wishlist
 * @access  Private
 */
router.get('/get', protect, getUser);

/**
 * @route   POST /api/users/wishlist
 * @desc    Add or remove coin from wishlist
 * @access  Private
 */
router.post('/wishlist', protect, addCoinToWishlist);

module.exports = router;
