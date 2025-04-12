const jwt = require("jsonwebtoken");
require("dotenv").config();

// Use constant for secret key, following naming convention
const SECRET_KEY = process.env.SECRET_KEY;

/**
 * Authentication middleware
 * Verifies JWT token from headers and adds user data to request object
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void}
 */
function auth(req, res, next) {
  try {
    // Check for token in Authorization header (standard practice)
    const authHeader =
      req.headers.authorization || req.headers["x-authorization"];

    if (!authHeader) {
      return res.status(401).json({
        status: false,
        message: "Authentication required",
      });
    }

    // Support both "Bearer <token>" and plain token formats
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : authHeader;

    if (!token) {
      return res.status(401).json({
        status: false,
        message: "Invalid token format",
      });
    }

    // Verify token
    jwt.verify(token, SECRET_KEY, (err, decoded) => {
      if (err) {
        // Handle different JWT errors with appropriate responses
        if (err.name === "TokenExpiredError") {
          return res.status(401).json({
            status: false,
            message: "Token expired",
          });
        }

        return res.status(401).json({
          status: false,
          message: "Invalid token",
        });
      }

      // Add user data to request object
      req.userId = decoded.id;
      req.username = decoded.username;
      req.userRole = decoded.role || "user"; // Default to user role if not specified

      next();
    });
  } catch (error) {
    console.error("Authentication error:", error);
    return res.status(500).json({
      status: false,
      message: "Authentication failed",
    });
  }
}

module.exports = auth;
