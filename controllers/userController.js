const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/userModel");

const registerUser = async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  if (!firstName || !lastName || !email || !password) {
    res.status(400);
    throw new Error("Please enter all fields");
  }

  res.json({
    status: "Register Success!",
  });
};

const signinUser = async (req, res) => {
  res.json({
    status: "Signin Success!",
  });
};

const getUser = async (req, res) => {
  res.json({
    status: "Get User Success!",
  });
};

module.exports = {
  registerUser,
  signinUser,
  getUser,
};
