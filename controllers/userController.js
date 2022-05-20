const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/userModel");
const moment = require("moment");
const axios = require('axios').default;
const { db } = require("../models/userModel");

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
  console.log(user, "user okay");

  if (user && (await bcrypt.compare(password, user.password))) {
    res.json({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      token: generateToken(user._id),
    });
  } else {
    res.status(400).json ({
      message: "Invalid email or password"
    })
  }
};

const getUser = async (req, res) => {
  const { _id, firstName, lastName, email, wishlist } = await User.findById(
    req.user.id
  );
  const coinData = await axios.get(
    "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false"
  ).then ((response) => {
    return response.data;
  });

  // //find the coin from coindata that matches with the coin in wishlist
  const matchedData = coinData.filter((c) => wishlist.includes(c.name));


  res.status(200).json({
    id: _id,
    firstName: firstName,
    lastName: lastName,
    email: email,
    wishlist: matchedData,
  });
};

const addCoinToWishlist = async (req, res) => {
  try {
    const { coin } = req.body;
    if (coin) {
      const user = await db.collection("users").findOne({
        email: req.body.user_email,
      });
      //check if coin already exist in user's wishlist
      const coinExist = user.wishlist?.find((c) => c === coin);

      if (coin && !coinExist) {
        console.log("add coin");
        await db
          .collection("users")
          .updateOne({ _id: user._id }, { $push: { wishlist: coin } });
        res.status(200).json({
          message: `${coin} added to wishlist`,
        });
      } else {
        await db
          .collection("users")
          .updateOne({ _id: user._id }, { $pull: { wishlist: coin } });
        res.status(200).json({
          message: `${coin} removed from wishlist`,
        });
      }
    }
  } catch (err) {
    res.status(401).send({
      message: err.message,
    });
  }
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
  addCoinToWishlist,
};
