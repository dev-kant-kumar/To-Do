const express = require("express");
const UserRoutes = express.Router();
const {
  signUp,
  signIn,
  forgotPassword,
  getUserData,
  updateProfile,
} = require("../controllers/userController");
const auth = require("../middlewares/auth");

UserRoutes.post("/signup", signUp);
UserRoutes.post("/signin", signIn);
UserRoutes.post("/forgotpassword", forgotPassword);
UserRoutes.get("/getUserData", auth, getUserData);
UserRoutes.post("/updateprofile", auth, updateProfile);

module.exports = UserRoutes;
