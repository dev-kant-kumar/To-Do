const user = require("../models/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
require("dotenv").config();
const key = process.env.SECRET_KEY;
const saltRounds = 10;

async function signUp(req, res) {
  const { name, username, email, password } = req.body;

  const isThisUserExist = await user.findOne({ username: username });

  if (isThisUserExist) {
    res.send({
      status: false,
      message: "You are already registered!",
    });
  } else {
    var hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = new user({
      name: name,
      username: username,
      email: email,
      password: hashedPassword,
      date: new Date(),
    });

    try {
      await newUser.save();
      res.send({
        status: true,
        message: "Account creation successful",
      });
    } catch (err) {
      console.error(err);
      res.send({
        status: false,
        message: "Account creation failed!",
      });
    }
  }
}

async function signIn(req, res) {
  const { username, password } = req.body;

  const existingUser = await user.findOne({ username: { $eq: username } });

  if (!existingUser) {
    res.send({
      status: false,
      message: "No account found!",
    });
  } else {
    const checkPwd = await bcrypt.compare(password, existingUser.password);

    const token = jwt.sign({ id: existingUser._id, username: username }, key);

    if (checkPwd) {
      res.send({
        status: true,
        message: "Login successful", // for signIn response purpose
        token: token,
        userData: existingUser,
      });
    } else {
      res.send({
        status: false,
        message: "Incorrect Password!",
      });
    }
  }
}

async function forgotPassword(req, res) {}

async function getUserData(req, res) {
  const username = req.username;
  if (username) {
    const userData = await user.findOne({ username: { $eq: username } });
    if (userData) {
      res.json({
        status: true,
        data: userData,
      });
    } else {
      res.json({
        status: false,
        message: "Unauthorized",
      });
    }
  }
}

async function updateProfile(req, res) {
  const username = req.username;
  const { name, email } = req.body;

  if (!username) {
    return res.send({
      status: false,
      message: "Unauthorized access",
    });
  }

  try {
    // Check if the email is already in use by another user
    if (email) {
      const emailExists = await user.findOne({ email: email, username: { $ne: username } });
      if (emailExists) {
        return res.send({
          status: false,
          message: "Email is already in use by another account",
        });
      }
    }

    const updatedUser = await user.findOneAndUpdate(
      { username: username },
      { name: name, email: email },
      { new: true }
    );

    if (updatedUser) {
      res.send({
        status: true,
        message: "Profile updated successfully",
        userData: updatedUser,
      });
    } else {
      res.send({
        status: false,
        message: "User not found",
      });
    }
  } catch (err) {
    console.error(err);
    res.send({
      status: false,
      message: "Failed to update profile details",
    });
  }
}

module.exports = { signUp, signIn, forgotPassword, getUserData, updateProfile };
