const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const dotenv = require("dotenv");
const connectDB = require("./src/config/db");
const morgan = require("morgan");

const serverLogStream = require("./src/middlewares/logger");
// Load environment variables
dotenv.config();

// Routes
const UserRoutes = require("./src/routes/userRoutes");
const TodoRoutes = require("./src/routes/todoRoutes");
const TodoFiltersRoutes = require("./src/routes/todoFiltersRoutes");

// App initialization
const app = express();
app.set("trust proxy", 1); // Trust first proxy (Render, Nginx, etc.) for correct client IP tracking

const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: [
      "https://todo.devkantkumar.com",
      "http://todo.devkantkumar.com",
      "http://localhost:5173",
      "http://localhost:5174"
    ],
    optionsSuccessStatus: 200,
    credentials: true,
  }),
);
app.use(helmet());

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300, // Increased from 50 to 300 to accommodate SPA client requests
    standardHeaders: true,
    legacyHeaders: false,
    message: "Too many requests from this IP, please try again later.",
  }),
);

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
app.use(morgan("combined", { stream: serverLogStream }));

// Health Check
app.get("/", (req, res) => {
  res.status(200).send("This is To-Do Web App Backend Serever");
});

app.get("/health", (req, res) => {
  return res.status(200).json({
    message: "To-Do App backend server is running health.",
  });
});

// Routes
app.use("/todo", TodoRoutes);
app.use("/filters", TodoFiltersRoutes);
app.use("/user", UserRoutes);
app.use("/email", require("./src/routes/emailPreviewRoutes"));

// Server
app.listen(PORT, () => {
  console.log(`Server Environment : ${process.env.NODE_ENV}`);

  if (process.env.NODE_ENV === "development") {
    console.log(`Server running at  :  http://localhost:${PORT}`);
  }
});
