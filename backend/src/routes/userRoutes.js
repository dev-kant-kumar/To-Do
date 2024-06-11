const express = require("express");
const UserRoutes = express.Router();
const {
  signUp,
  signIn,
  forgotPassword,
} = require("../controllers/userController");

UserRoutes.post("/signup", signUp);
UserRoutes.post("/signin", signIn);
UserRoutes.post("/forgotpassword", forgotPassword);

module.exports = UserRoutes;
