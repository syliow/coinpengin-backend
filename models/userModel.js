const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  firstName: String,
  lastName: String,
  email: String,
  password: String,
  wishlist: Array,
});

module.exports = mongoose.model("User", userSchema);
