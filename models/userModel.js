const mongoose = require('mongoose');

/**
 * User Schema
 * Stores user information and coin wishlist
 */
const userSchema = mongoose.Schema(
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
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email',
      ],
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
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

// Instance method to add coin to wishlist
/**
 * @param {string} coinName - Name of the coin to add
 */
userSchema.methods.addToWishlist = function (coinName) {
  if (!this.wishlist.includes(coinName)) {
    this.wishlist.push(coinName);
  }
  return this.save();
};

/**
 * Instance method to remove coin from wishlist
 * @param {string} coinName - Name of the coin to remove
 */
userSchema.methods.removeFromWishlist = function (coinName) {
  this.wishlist = this.wishlist.filter((coin) => coin !== coinName);
  return this.save();
};

module.exports = mongoose.model('User', userSchema);
