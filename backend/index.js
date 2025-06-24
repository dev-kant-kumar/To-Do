const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const dotenv = require("dotenv");
const connectDB = require("./src/config/db");

// Load environment variables
dotenv.config();

// Routes
const UserRoutes = require("./src/routes/userRoutes");
const TodoRoutes = require("./src/routes/todoRoutes");
const TodoFiltersRoutes = require("./src/routes/todoFiltersRoutes");

// App initialization
const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: ["https://todo.devkantkumar.com"],
    optionsSuccessStatus: 200,
    credentials: true,
  })
);
app.use(helmet());

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 50,
    standardHeaders: true,
    legacyHeaders: false,
    message: "Too many requests from this IP, please try again later.",
  })
);

// Health Check
app.get("/", (req, res) => {
  res.status(200).send("✅ To-Do App Backend is running.");
});

// Routes
app.use("/todo", TodoRoutes);
app.use("/filters", TodoFiltersRoutes);
app.use("/user", UserRoutes);

// Server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
