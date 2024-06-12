const express = require("express");
const UserRoutes = express.Router();
const {
  signUp,
  signIn,
  forgotPassword,
  getUserData,
} = require("../controllers/userController");

UserRoutes.post("/signup", signUp);
UserRoutes.post("/signin", signIn);
UserRoutes.post("/forgotpassword", forgotPassword);
UserRoutes.get("/getUserData", getUserData);

module.exports = UserRoutes;
