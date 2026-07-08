const User = require("../models/userModel");
const StreakEntry = require("../models/streakModel");

const STREAK_MILESTONES = [3, 7, 14, 30, 100, 365];

const countUnlockedBadges = (streak) => {
  return STREAK_MILESTONES.filter((days) => (streak || 0) >= days).length;
};

function getLocalDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

async function getLeaderboard(req, res) {
  const currentUserId = req.id;
  const sortBy = req.query.sortBy === "streak" ? "streak" : "xp";

  try {
    // Retrieve all verified users with required fields
    const users = await User.find(
      { isVerified: true },
      "name username level xp currentStreak longestStreak"
    );

    // The stored `currentStreak` field is only recomputed when a user completes
    // or un-completes a task, so it goes stale (inflated) for users who have
    // since stopped. A streak is only "live" if the user logged activity today
    // or yesterday (mirrors computeActiveStreak's one-day grace window). One
    // batch query tells us who is still active; everyone else is decayed to 0.
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const liveKeys = [getLocalDateKey(now), getLocalDateKey(yesterday)];
    const liveEntries = await StreakEntry.find(
      { dateKey: { $in: liveKeys }, count: { $gt: 0 } },
      "userId"
    );
    const liveUserIds = new Set(liveEntries.map((e) => e.userId.toString()));

    // Map Mongoose documents to plain objects and sanitize default values
    let rankingsList = users.map((user) => {
      const u = user.toObject();
      const streak = liveUserIds.has(u._id.toString()) ? u.currentStreak || 0 : 0;
      // Badges are permanent: award them from the all-time longest streak so
      // they aren't lost when the active streak decays. Fall back to the live
      // streak for users whose longestStreak hasn't been backfilled yet.
      const badgeStreak = Math.max(u.longestStreak || 0, streak);
      return {
        id: u._id.toString(),
        name: u.name,
        username: u.username,
        level: u.level || 1,
        xp: u.xp || 0,
        currentStreak: streak,
        badgesCount: countUnlockedBadges(badgeStreak),
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
