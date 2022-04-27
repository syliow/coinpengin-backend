const express = require("express");
const router = express.Router();
const {
  registerUser,
  signinUser,
  getUser,
} = require("../controllers/userController");

router.post("/register", registerUser);
router.post("/login", signinUser);
router.get("/get", getUser);

module.exports = router;
