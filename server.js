import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import model from "./model.js";
import userSchema from "./model.js";
import dotenv from "dotenv";

// const connectDB = require("./config/db");
// import {connectDB} from "./config/db";
dotenv.config();
const app = express();
const port = process.env.PORT || 5000;
// let single_sku_db = dbo_new.db(SINGLE_SKU_DB_NAME);
// const connectDB = "./config/db.js";

app.use(cors());
app.use(express.json());

const mongoURI = process.env.MONGO_URL;

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.once("open", () => {
  console.log("Connected to mongoDB");
});

// dotenv.config();
// connectDB();

app.get("/api", (req, res) => {
  res.status(200).send({
    name: "Hello",
    size: "Small",
  });
  // res.json("Hello World from BE");
});

app.post("/api/users/signup", async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    const userInfo = firstName && lastName && email && password;

    if (userInfo) {
      res.status(200).send({
        message: "User created successfully",
      });
    } else {
      res.status(400).send({
        message: "Please enter all fields",
      });
    }

    const createUser = await db.collection("users").insertOne({
      firstName: firstName,
      lastName: lastName,
      email: email,
      password: password,
    });

    if (!createUser) {
      res.status(400).send({
        message: "User not created",
      });
    }
    res.send(true);
  } catch (err) {
    res.status(400).send({
      message: err.message,
    });
  }
});

app.post("/api/users/signin", async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(email, "email");
    console.log(password, "password");

    let user;
    if (email && password) {
      //here
      user = await db.collection("users").findOne({
        email: email,
        password: password,
      });
      console.log(user, "User found ?");
    } else {
      res.status(400).send({
        message: "Please enter all fields",
      });
    }

    if (user) {
      console.log("got user");
      res.send(user);
    } else {
      console.log("erm no user?");
      res.status(400).send({
        message: "User not found",
      });
    }
  } catch (err) {
    res.status(401).send({
      message: err.message,
    });
  }
});

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
