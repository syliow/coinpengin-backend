const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");

const protect = asyncHandler(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    //get token from header
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    res.status(401)
    throw new Error ("You are not logged in!");
  }

  try {
    //verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    //get user from token
    req.user = await User.findById(decoded.id).select("-password");
    next();
  } catch (err) {
    console.log(err);
    res.status(400).json({
      error: "You are not logged in!",
    });
  }
});

module.exports = { protect };
