const express = require("express");
const router = express.Router();
const {
  registerUser,
  signinUser,
  getUser,
} = require("../controllers/userController");

const { protect } = require("../middleware/authMiddleware");

router.post("/register", registerUser);
router.post("/login", signinUser);
router.get("/get", protect, getUser);

module.exports = router;
