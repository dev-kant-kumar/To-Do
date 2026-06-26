const express = require("express");
const LeaderboardRoutes = express.Router();
const auth = require("../middlewares/auth");
const { getLeaderboard } = require("../controllers/leaderboardController");

LeaderboardRoutes.get("/", auth, getLeaderboard);

module.exports = LeaderboardRoutes;
