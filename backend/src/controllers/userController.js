const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
require("dotenv").config();
const crypto = require("crypto");

// Constants
const SECRET_KEY = process.env.SECRET_KEY;
const SALT_ROUNDS = 10;
const TOKEN_EXPIRY = "24h";

/**
 * User registration
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
async function signUp(req, res) {
  try {
    const { name, username, email, password } = req.body;

    // Input validation
    if (!name || !username || !email || !password) {
      return res.status(400).json({
        status: false,
        message: "All fields are required",
      });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        status: false,
        message: "Invalid email format",
      });
    }

    // Username format validation
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(username) || username.length < 3) {
      return res.status(400).json({
        status: false,
        message:
          "Username must be at least 3 characters and contain only letters, numbers and underscores",
      });
    }

    // Check if user already exists by username OR email
    const existingUser = await User.findOne({
      $or: [{ username }, { email }],
    });

    if (existingUser) {
      return res.status(409).json({
        status: false,
        message:
          existingUser.email === email
            ? "Email already registered"
            : "Username already taken",
      });
    }

    // Password strength validation
    if (password.length < 8) {
      return res.status(400).json({
        status: false,
        message: "Password must be at least 8 characters",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Create new user
    const newUser = new User({
      name,
      username,
      email,
      password: hashedPassword,
      date: new Date().toISOString(), // For backward compatibility with existing schema
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await newUser.save();

    return res.status(201).json({
      status: true,
      message: "Account created successfully",
    });
  } catch (error) {
    console.error("Sign-up error:", error);

    // Handle Mongoose validation errors
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        status: false,
        message: messages[0], // Return first validation error
      });
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(409).json({
        status: false,
        message: `${field === "email" ? "Email" : "Username"} already exists`,
      });
    }

    return res.status(500).json({
      status: false,
      message: "Registration failed. Please try again later.",
    });
  }
}

/**
 * User login
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
async function signIn(req, res) {
  try {
    const { username, password } = req.body;

    // Input validation
    if (!username || !password) {
      return res.status(400).json({
        status: false,
        message: "Username and password are required",
      });
    }

    // Find user by username or email
    const existingUser = await User.findOne({
      $or: [
        { username },
        { email: username }, // Allow login with email as well
      ],
    }).select("+password"); // Explicitly include password field

    if (!existingUser) {
      return res.status(401).json({
        status: false,
        message: "Invalid credentials",
      });
    }

    // Check if user is active
    if (!existingUser.isActive) {
      return res.status(403).json({
        status: false,
        message: "Account is disabled. Please contact support.",
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(
      password,
      existingUser.password
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        status: false,
        message: "Invalid credentials",
      });
    }

    // Create JWT token only after password is verified
    const token = jwt.sign(
      {
        id: existingUser._id,
        username: existingUser.username,
        role: existingUser.role,
      },
      SECRET_KEY,
      { expiresIn: TOKEN_EXPIRY }
    );

    // Update last login date
    await User.updateOne(
      { _id: existingUser._id },
      { $set: { lastLogin: new Date(), updatedAt: new Date() } }
    );

    // Remove password from response
    const userData = existingUser.toObject();
    delete userData.password;

    return res.status(200).json({
      status: true,
      message: "Login successful",
      token,
      userData,
    });
  } catch (error) {
    console.error("Sign-in error:", error);
    return res.status(500).json({
      status: false,
      message: "Login failed. Please try again later.",
    });
  }
}

/**
 * Password reset request
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
async function forgotPassword(req, res) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        status: false,
        message: "Email is required",
      });
    }

    const existingUser = await User.findOne({ email });

    if (!existingUser) {
      // Return success even if user not found for security
      return res.status(200).json({
        status: true,
        message:
          "If your email is registered, you will receive password reset instructions",
      });
    }

    // Generate random token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Hash token before storing it
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // Save to database
    existingUser.resetPasswordToken = hashedToken;
    existingUser.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    existingUser.updatedAt = new Date();

    await existingUser.save();

    // TODO: Send email with reset link
    // const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    // await sendEmail({ to: email, subject: 'Password Reset', text: `Reset your password: ${resetUrl}` });

    return res.status(200).json({
      status: true,
      message:
        "If your email is registered, you will receive password reset instructions",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return res.status(500).json({
      status: false,
      message: "Request failed. Please try again later.",
    });
  }
}

/**
 * Reset password with token
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
async function resetPassword(req, res) {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({
        status: false,
        message: "Token and new password are required",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        status: false,
        message: "Password must be at least 8 characters",
      });
    }

    // Hash the token to compare with stored hash
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // Find user with valid token
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        status: false,
        message: "Invalid or expired token",
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Update user
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    user.updatedAt = new Date();

    await user.save();

    return res.status(200).json({
      status: true,
      message: "Password has been reset successfully",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return res.status(500).json({
      status: false,
      message: "Password reset failed. Please try again later.",
    });
  }
}

/**
 * Get user data using JWT token
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
async function getUserData(req, res) {
  try {
    const { userId } = req;

    if (!userId) {
      return res.status(401).json({
        status: false,
        message: "Authentication required",
      });
    }

    const userData = await User.findById(userId);

    if (!userData) {
      return res.status(404).json({
        status: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      status: true,
      data: userData,
    });
  } catch (error) {
    console.error("Get user data error:", error);
    return res.status(500).json({
      status: false,
      message: "Failed to retrieve user data",
    });
  }
}

/**
 * Update user profile
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
async function updateProfile(req, res) {
  try {
    const { userId } = req;
    const { name, email, profilePicture } = req.body;

    if (!userId) {
      return res.status(401).json({
        status: false,
        message: "Authentication required",
      });
    }

    // Find user
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        status: false,
        message: "User not found",
      });
    }

    // Prepare update data
    const updates = {};

    if (name) updates.name = name;

    if (email && email !== user.email) {
      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          status: false,
          message: "Invalid email format",
        });
      }

      // Check if email already exists
      const emailExists = await User.findOne({ email, _id: { $ne: userId } });
      if (emailExists) {
        return res.status(409).json({
          status: false,
          message: "Email already registered by another user",
        });
      }

      updates.email = email;
    }

    if (profilePicture) {
      updates.profilePicture = profilePicture;
    }

    updates.updatedAt = new Date();

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      status: true,
      message: "Profile updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    console.error("Update profile error:", error);

    // Handle validation errors
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        status: false,
        message: messages[0],
      });
    }

    return res.status(500).json({
      status: false,
      message: "Failed to update profile",
    });
  }
}

/**
 * Change user password
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
async function changePassword(req, res) {
  try {
    const { userId } = req;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        status: false,
        message: "Current password and new password are required",
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        status: false,
        message: "New password must be at least 8 characters",
      });
    }

    // Find user
    const user = await User.findById(userId).select("+password");

    if (!user) {
      return res.status(404).json({
        status: false,
        message: "User not found",
      });
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        status: false,
        message: "Current password is incorrect",
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);

    // Update password
    user.password = hashedPassword;
    user.updatedAt = new Date();

    await user.save();

    return res.status(200).json({
      status: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Change password error:", error);
    return res.status(500).json({
      status: false,
      message: "Failed to change password",
    });
  }
}

/**
 * Middleware to verify JWT token
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 * @returns {Promise<void>}
 */
function verifyToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        status: false,
        message: "Authentication required",
      });
    }

    const token = authHeader.split(" ")[1];

    jwt.verify(token, SECRET_KEY, (err, decoded) => {
      if (err) {
        return res.status(401).json({
          status: false,
          message: "Invalid or expired token",
        });
      }

      req.userId = decoded.id;
      req.username = decoded.username;
      req.userRole = decoded.role;
      next();
    });
  } catch (error) {
    console.error("Token verification error:", error);
    return res.status(500).json({
      status: false,
      message: "Authentication failed",
    });
  }
}

/**
 * Check if user has admin role
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 * @returns {void}
 */
function isAdmin(req, res, next) {
  if (req.userRole !== "admin") {
    return res.status(403).json({
      status: false,
      message: "Access denied. Admin privileges required.",
    });
  }
  next();
}

module.exports = {
  signUp,
  signIn,
  forgotPassword,
  resetPassword,
  getUserData,
  updateProfile,
  changePassword,
  verifyToken,
  isAdmin,
};
