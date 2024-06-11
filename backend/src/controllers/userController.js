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
      SECRET_KEY,
      { expiresIn: "1h" }
    );
    console.log(token);

    if (checkPwd) {
      res.send({
        status: true,
        message: "Authentication successful",
        id: existingUser._id,
        username: username,
        token: token,
      });
    } else {
      res.send({
        status: false,
        message: "Incorrect Password!",
      });
    }
  }

  const isThisUserRegistered = user.findOne({ username: username });
}

async function forgotPassword(req, res) {}

module.exports = { signUp, signIn, forgotPassword };
