const express = require("express");
const cors = require("cors");
const helmet = require("helmet"); // Added for security
const rateLimit = require("express-rate-limit");
const morgan = require("morgan"); // Added for logging
const compression = require("compression"); // Added for performance
const app = express();

// Load environment variables
require("dotenv").config();

// Database connection
const connectDB = require("./src/config/db");

// Route imports
const TodoRoutes = require("./src/routes/todoRoutes");
const UserRoutes = require("./src/routes/userRoutes");
const TodoFiltersRoutes = require("./src/routes/todoFiltersRoutes");

// Define constants
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || "development";
const CORS_ORIGIN = process.env.CORS_ORIGIN || "*";

// Security middleware
app.use(helmet()); // Set security HTTP headers

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: NODE_ENV === "production" ? 100 : 1000, // Limit based on environment
  standardHeaders: true, // Return rate limit info in RateLimit-* headers
  legacyHeaders: false, // Disable X-RateLimit-* headers
  message: {
    status: false,
    message: "Too many requests, please try again later.",
  },
});
app.use("/api", limiter); // Apply rate limiting to API routes

// CORS configuration
const corsOptions = {
  origin: CORS_ORIGIN !== "*" ? CORS_ORIGIN.split(",") : "*",
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Body parser middleware
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: false, limit: "1mb" }));

// Compression middleware
app.use(compression());

// Logging middleware
if (NODE_ENV === "development") {
  app.use(morgan("dev"));
} else {
  app.use(morgan("combined"));
}

// API health check route
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "UP",
    environment: NODE_ENV,
    timestamp: new Date(),
  });
});

// Welcome route
app.get("/", (req, res) => {
  res.status(200).json({
    message: "Welcome to Todo Application API",
    documentation: "/api-docs", // For future Swagger/OpenAPI docs
    version: "1.0.0",
  });
});

// API routes
app.use("/api/todos", TodoRoutes);
app.use("/api/filters", TodoFiltersRoutes);
app.use("/api/users", UserRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    status: false,
    message: "Endpoint not found",
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);

  res.status(err.statusCode || 500).json({
    status: false,
    message: err.message || "Internal server error",
    ...(NODE_ENV === "development" && { stack: err.stack }),
  });
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`Server running in ${NODE_ENV} mode on port ${PORT}`);

  // Connect to database
  connectDB()
    .then(() => console.log("Database connected successfully"))
    .catch((err) => {
      console.error("Database connection error:", err);
      process.exit(1); // Exit if DB connection fails
    });
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Promise Rejection:", err);
  server.close(() => process.exit(1));
});

module.exports = app; // Export for testing purposes
