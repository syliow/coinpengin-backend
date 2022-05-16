const express = require("express");
const router = express.Router();
const {
  registerUser,
  signinUser,
  getUser,
  addCoinToWishlist,
} = require("../controllers/userController");

const { protect } = require("../middleware/authMiddleware");

router.post("/register", registerUser);
router.post("/login", signinUser);
router.get("/get", protect, getUser);
router.post("/wishlist", addCoinToWishlist);

module.exports = router;
