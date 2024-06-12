const user = require("../models/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const SECRET_KEY = "de3u23h3j!2gwt";

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

    if (newUser.save()) {
      res.send({
        status: true,
        message: "Account creation successful",
      });
    }
  }
}
async function signIn(req, res) {
  const { username, password } = req.body;

  const existingUser = await user.findOne({ username: username });

  if (!existingUser) {
    res.send({
      status: false,
      message: "No account found!",
    });
  } else {
    // console.log(password, existingUser);
    const checkPwd = await bcrypt.compare(password, existingUser.password);

    const token = jwt.sign(
      { id: existingUser._id, username: username },
      SECRET_KEY
    );
    console.log(token);

    if (checkPwd) {
      res.send({
        status: true,
        message: "Authentication successful", // for signIn response purpose
        token: token,

        name: existingUser.name, // to user to create user profile dashboard
        username: username,
        email: existingUser.email,
        date: existingUser.date,
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
  const token = req.headers["x-authorization"];
  if (token) {
    const finalToken = token.split(" ")[1];
    const decodedToken = jwt.verify(finalToken, SECRET_KEY);
    const username = decodedToken.username;
    if (username) {
      const userData = await user.findOne({ username: username });
      if (userData) {
        res.json({
          status: true,
          data: userData,
        });
      } else {
        res.json({
          status: false,
          message: "Unauthorised",
        });
      }
    }
  } else {
    res.json({
      status: false,
      message: "Unauthenticated",
    });
  }
}

module.exports = { signUp, signIn, forgotPassword, getUserData };
