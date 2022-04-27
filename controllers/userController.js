const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/userModel");
const moment = require("moment");

const registerUser = async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  if (!firstName || !lastName || !email || !password) {
    res.status(400);
    throw new Error("Please enter all fields");
  }

  const userExist = await User.findOne({ email: email });

  if (userExist) {
    res.status(400);
    throw new Error("User already exist");
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = await User.create({
    firstName: firstName,
    lastName: lastName,
    email: email,
    password: hashedPassword,
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      created_at: moment(user.created_at),
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error("User not created");
  }
};

const signinUser = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email: email });

  if (user && (await bcrypt.compare(password, user.password))) {
    res.json({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      token: generateToken(user._id),
    });
    
  } else {
    res.status(400);
    throw new Error("Invalid email or password");
  }
};

const getUser = async (req, res) => {
  const { _id, firstName, lastName, email } = await User.findById(req.user.id);

  res.status(200).json({
    id: _id,
    firstName: firstName,
    lastName: lastName,
    email: email,
  });
};

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
};

module.exports = {
  registerUser,
  signinUser,
  getUser,
};
