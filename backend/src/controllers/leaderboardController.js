const User = require("../models/userModel");

const STREAK_MILESTONES = [3, 7, 14, 30, 100, 365];

const countUnlockedBadges = (streak) => {
  return STREAK_MILESTONES.filter((days) => (streak || 0) >= days).length;
};

async function getLeaderboard(req, res) {
  const currentUserId = req.id;
  const sortBy = req.query.sortBy === "streak" ? "streak" : "xp";

  try {
    // Retrieve all verified users with required fields
    const users = await User.find(
      { isVerified: true },
      "name username level xp currentStreak"
    );

    // Map Mongoose documents to plain objects and sanitize default values
    let rankingsList = users.map((user) => {
      const u = user.toObject();
      return {
        id: u._id.toString(),
        name: u.name,
        username: u.username,
        level: u.level || 1,
        xp: u.xp || 0,
        currentStreak: u.currentStreak || 0,
        badgesCount: countUnlockedBadges(u.currentStreak || 0),
      };
    });

    // Sort rankings
    if (sortBy === "streak") {
      rankingsList.sort((a, b) => {
        if (b.currentStreak !== a.currentStreak) {
          return b.currentStreak - a.currentStreak;
        }
        return b.xp - a.xp; // Tie breaker: XP
      });
    } else {
      rankingsList.sort((a, b) => {
        if (b.xp !== a.xp) {
          return b.xp - a.xp;
        }
        return b.currentStreak - a.currentStreak; // Tie breaker: Streak
      });
    }

    // Assign rank positions
    rankingsList = rankingsList.map((user, index) => ({
      ...user,
      rank: index + 1,
    }));

    // Find requesting user rank
    let currentUserRanking = null;
    const selfIndex = rankingsList.findIndex((u) => u.id === currentUserId.toString());
    if (selfIndex !== -1) {
      currentUserRanking = rankingsList[selfIndex];
    }

    // Limit rankings payload to top 100
    const topRankings = rankingsList.slice(0, 100);

    res.send({
      status: true,
      rankings: topRankings,
      currentUser: currentUserRanking,
    });
  } catch (err) {
    console.error("[getLeaderboard] Error:", err);
    res.status(500).send({
      status: false,
      message: "An internal server error occurred while retrieving the leaderboard.",
    });
  }
}

module.exports = {
  getLeaderboard,
};
