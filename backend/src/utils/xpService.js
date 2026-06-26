const User = require("../models/userModel");
const StreakEntry = require("../models/streakModel");
const Todo = require("../models/todoModel");

function getLocalDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Compute the user's current active streak count by reading StreakEntry history logs. */
async function computeActiveStreak(userId) {
  try {
    const entries = await StreakEntry.find({ userId: userId.toString(), count: { $gt: 0 } });
    const activeDates = new Set(entries.map((e) => e.dateKey));

    const today = new Date();
    let cursor = new Date(today);
    let cursorKey = getLocalDateKey(cursor);

    // If today is empty, check yesterday to allow a one-day grace window
    if (!activeDates.has(cursorKey)) {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayKey = getLocalDateKey(yesterday);
      if (activeDates.has(yesterdayKey)) {
        cursor = yesterday;
      } else {
        return 0; // neither today nor yesterday has completions
      }
    }

    let streak = 0;
    while (true) {
      const key = getLocalDateKey(cursor);
      if (activeDates.has(key)) {
        streak++;
        cursor.setDate(cursor.getDate() - 1);
      } else {
        break;
      }
    }
    return streak;
  } catch (err) {
    console.error("[computeActiveStreak] Error:", err);
    return 0;
  }
}

/** Compute the user's longest ever streak count by reading StreakEntry history logs. */
async function computeLongestStreak(userId) {
  try {
    const entries = await StreakEntry.find({ userId: userId.toString(), count: { $gt: 0 } });
    if (!entries.length) return 0;

    const activeDates = Array.from(new Set(entries.map((e) => e.dateKey))).sort();
    let maxStreak = 0;
    let currentStreak = 0;
    let prevTime = null;

    for (const dateKey of activeDates) {
      const parts = dateKey.split("-");
      const currTime = Date.UTC(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));

      if (prevTime === null) {
        currentStreak = 1;
      } else {
        const diffDays = Math.round((currTime - prevTime) / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          currentStreak++;
        } else if (diffDays > 1) {
          if (currentStreak > maxStreak) {
            maxStreak = currentStreak;
          }
          currentStreak = 1;
        }
      }
      prevTime = currTime;
    }
    if (currentStreak > maxStreak) {
      maxStreak = currentStreak;
    }
    return maxStreak;
  } catch (err) {
    console.error("[computeLongestStreak] Error:", err);
    return 0;
  }
}

/** Calculate XP and points rewards based on task parameters and active streak count. */
function calculateTaskXP(task, activeStreak) {
  let xp = 10; // Base XP
  let points = 10; // Base points

  if (task.priority === "high") {
    xp += 10;
    points += 10;
  } else if (task.priority === "medium") {
    xp += 5;
    points += 5;
  }

  if (task.starred) {
    xp += 5;
    points += 5;
  }

  // Active streak bonus: +1 XP per day of active streak
  if (activeStreak > 0) {
    xp += activeStreak;
  }

  return { xp, points };
}

/** Update the user's cumulative XP, points, level, and active streak. */
async function applyTaskXPChange(userId, task, isCompleting) {
  try {
    const user = await User.findOne({ _id: userId });
    if (!user) return null;

    // Calculate active streak and task rewards
    const activeStreak = await computeActiveStreak(userId);
    const reward = calculateTaskXP(task, activeStreak);

    if (isCompleting) {
      user.xp = (user.xp || 0) + reward.xp;
      user.points = (user.points || 0) + reward.points;
    } else {
      user.xp = Math.max(0, (user.xp || 0) - reward.xp);
      user.points = Math.max(0, (user.points || 0) - reward.points);
    }

    user.currentStreak = activeStreak;

    // Recalculate level based on cumulative XP: nextLevelThreshold = level * 100
    let calcLevel = 1;
    let tempXp = user.xp;
    while (true) {
      const threshold = calcLevel * 100;
      if (tempXp >= threshold) {
        tempXp -= threshold;
        calcLevel++;
      } else {
        break;
      }
    }
    user.level = calcLevel;

    await user.save();
    return user;
  } catch (err) {
    console.error("[applyTaskXPChange] Error:", err);
    return null;
  }
}

/**
 * Recalculate a single user's XP/points/level from scratch based on all
 * their completed (non-deleted) todos. Call this on login to backfill
 * XP for tasks that were completed before the XP system launched.
 */
async function recalculateUserXP(userId) {
  try {
    const completedTodos = await Todo.find({
      userId: userId.toString(),
      completed: true,
      deleted: false,
    });

    if (!completedTodos.length) return null;

    const activeStreak = await computeActiveStreak(userId);

    let totalXp = 0;
    let totalPoints = 0;

    for (const todo of completedTodos) {
      const reward = calculateTaskXP(todo, activeStreak);
      totalXp += reward.xp;
      totalPoints += reward.points;
    }

    const userDoc = await User.findById(userId);
    if (!userDoc) return null;

    // Only update if the recalculated value is higher than current
    // (avoids wiping XP that may have been added by future actions)
    if (totalXp <= (userDoc.xp || 0)) return userDoc;

    userDoc.xp = totalXp;
    userDoc.points = totalPoints;
    userDoc.currentStreak = activeStreak;

    // Recalculate level
    let calcLevel = 1;
    let tempXp = totalXp;
    while (true) {
      const threshold = calcLevel * 100;
      if (tempXp >= threshold) {
        tempXp -= threshold;
        calcLevel++;
      } else {
        break;
      }
    }
    userDoc.level = calcLevel;

    await userDoc.save();
    return userDoc;
  } catch (err) {
    console.error("[recalculateUserXP] Error:", err);
    return null;
  }
}

/**
 * Pure function: compute full XP breakdown from a raw cumulative XP value.
 * Mirrors frontend gamificationUtils.computeXPBreakdown exactly.
 *
 * Level formula: XP needed to reach level L = sum(i*100) for i=1..L-1
 *   L1=0, L2=100, L3=300, L4=600, L5=1000 …
 */
function computeXPBreakdown(totalXp) {
  const xp = Math.max(0, totalXp || 0);
  let level = 1;
  let remaining = xp;

  while (true) {
    const threshold = level * 100;
    if (remaining >= threshold) {
      remaining -= threshold;
      level++;
    } else {
      break;
    }
  }

  const xpInLevel       = remaining;
  const xpForThisLevel  = level * 100;
  const xpToNext        = xpForThisLevel - xpInLevel;
  const progressPercent = Math.min(Math.round((xpInLevel / xpForThisLevel) * 100), 100);

  return { level, xpInLevel, xpForThisLevel, xpToNext, progressPercent, totalXp: xp };
}

const STREAK_MILESTONES_DAYS = [3, 7, 14, 30, 100, 365];

/** Returns the count of badges earned for a given streak. */
function countEarnedBadges(streak) {
  return STREAK_MILESTONES_DAYS.filter((d) => (streak || 0) >= d).length;
}

module.exports = {
  computeActiveStreak,
  computeLongestStreak,
  calculateTaskXP,
  applyTaskXPChange,
  recalculateUserXP,
  computeXPBreakdown,
  countEarnedBadges,
};
