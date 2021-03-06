const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const app = express();
const port = process.env.PORT || 5000;
dotenv.config();

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

app.get("/welcome", (req, res) => {
  res.status(200).send({
    message: "Welcome to CoinPengin Backend Server",
  });
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
      user = await db.collection("users").findOne({
        email: email,
        password: password,
      });
    } else {
      res.status(400).send({
        message: "Please enter all fields",
      });
    }

    if (user) {
      console.log("got user");
      const token = jwt.sign(
        {
          email: email,
          password: password,
        },
        "secret"
      );
      res.json({
        status: "Login Success!",
        user: token,
      });
    } else {
      res.status(400).send({
        message: "Invalid email or password. Please try again.",
      });
    }
  } catch (err) {
    res.status(401).send({
      message: err.message,
    });
  }
});

app.use("/api/users", require("./routes/userRoutes"));

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
