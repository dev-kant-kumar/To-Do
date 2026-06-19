const express = require("express");
const UserRoutes = express.Router();
const {
  signUp,
  signIn,
  forgotPassword,
  verifyOtp,
  resendOtp,
  resetPassword,
  getUserData,
  updateProfile,
  changePassword,
  requestDeleteOtp,
  deleteAccount,
} = require("../controllers/userController");
const auth = require("../middlewares/auth");

UserRoutes.post("/signup", signUp);
UserRoutes.post("/signin", signIn);
UserRoutes.post("/forgotpassword", forgotPassword);
UserRoutes.post("/verifyotp", verifyOtp);
UserRoutes.post("/resendotp", resendOtp);
UserRoutes.post("/resetpassword", resetPassword);
UserRoutes.get("/getUserData", auth, getUserData);
UserRoutes.post("/updateprofile", auth, updateProfile);
UserRoutes.post("/changepassword", auth, changePassword);
UserRoutes.post("/requestdeleteotp", auth, requestDeleteOtp);
UserRoutes.post("/deleteaccount", auth, deleteAccount);

module.exports = UserRoutes;
