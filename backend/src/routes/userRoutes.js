const express = require("express");
const UserRoutes = express.Router();
const {
  signUp,
  signIn,
  forgotPassword,
  resetPassword,
  getUserData,
  updateProfile,
  changePassword,
  verifyToken,
  isAdmin,
} = require("../controllers/userController");

/**
 * Public routes (no authentication required)
 */
UserRoutes.post("/signup", signUp);
UserRoutes.post("/signin", signIn);
UserRoutes.post("/forgot-password", forgotPassword); // Removed auth middleware - users don't need to be logged in to reset password
UserRoutes.post("/reset-password", resetPassword); // New endpoint for password reset with token

/**
 * Protected routes (authentication required)
 */
UserRoutes.get("/profile", verifyToken, getUserData); // Renamed for clarity
UserRoutes.put("/profile", verifyToken, updateProfile); // New endpoint to update user profile
UserRoutes.post("/change-password", verifyToken, changePassword); // New endpoint to change password

/**
 * Admin routes (admin role required)
 */
UserRoutes.get("/users", verifyToken, isAdmin, async (req, res) => {
  try {
    const users = await require("../models/userModel")
      .find({})
      .select("-password");
    return res.status(200).json({
      status: true,
      data: users,
    });
  } catch (error) {
    console.error("Get users error:", error);
    return res.status(500).json({
      status: false,
      message: "Failed to retrieve users",
    });
  }
});

module.exports = UserRoutes;
