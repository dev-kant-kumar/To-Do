const Todo = require("../models/todoModel");
const StreakEntry = require("../models/streakModel");

async function showAllTasks(req, res) {
  const userId = req.id;
  const allTasks = await Todo.find({ userId: { $eq: userId }, deleted: false });

  if (allTasks.length === 0) {
    res.send({ status: false, message: "No task found! Create tasks first.", length: 0 });
  } else {
    res.send(allTasks);
  }
}

async function showCompletedTasks(req, res) {
  const userId = req.id;
  const completedTask = await Todo.find({
    userId: { $eq: userId },
    completed: true,
    deleted: false,
  });

  if (completedTask.length === 0) {
    res.send({ status: false, message: "There are no tasks marked as completed.", length: 0 });
  } else {
    res.send(completedTask);
  }
}

async function showStarredTasks(req, res) {
  const userId = req.id;
  const starredTask = await Todo.find({
    userId: { $eq: userId },
    starred: true,
    deleted: false,
  });

  if (starredTask.length === 0) {
    res.send({ status: false, message: "There are no tasks marked as starred.", length: 0 });
  } else {
    res.send(starredTask);
  }
}

async function showTasksCreatedToday(req, res) {
  const userId = req.id;
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const TasksCreatedToday = await Todo.find({
    userId: userId,
    deleted: false,
    date: { $gte: startOfDay, $lt: endOfDay },
  });

  if (TasksCreatedToday.length === 0) {
    res.send({ status: false, message: "There are no tasks created today.", length: 0 });
  } else {
    res.send(TasksCreatedToday);
  }
}

async function showTasksCreatedWeekAgo(req, res) {
  const userId = req.id;
  const now = new Date();

  // Return tasks from the past 7 days (inclusive of today)
  const startOf7DaysAgo = new Date(now);
  startOf7DaysAgo.setDate(now.getDate() - 6); // 6 prior days + today = 7
  startOf7DaysAgo.setHours(0, 0, 0, 0);
  const endOfToday = new Date(now);
  endOfToday.setHours(23, 59, 59, 999);

  const TasksThisWeek = await Todo.find({
    userId: { $eq: userId },
    deleted: false,
    date: { $gte: startOf7DaysAgo, $lte: endOfToday },
  });

  if (TasksThisWeek.length === 0) {
    res.send({ status: false, message: "There are no tasks created in the past 7 days.", length: 0 });
  } else {
    res.send(TasksThisWeek);
  }
}

async function showDeletedTask(req, res) {
  const userId = req.id;
  const deletedTask = await Todo.find({ userId: { $eq: userId }, deleted: true });

  if (deletedTask.length === 0) {
    res.send({ status: false, message: "There are no tasks marked as deleted.", length: 0 });
  } else {
    res.send(deletedTask);
  }
}

async function getTodoCounts(req, res) {
  const userId = req.id;
  try {
    const allCount       = await Todo.countDocuments({ userId, deleted: false });
    const starredCount   = await Todo.countDocuments({ userId, starred: true, deleted: false });
    const completedCount = await Todo.countDocuments({ userId, completed: true, deleted: false });
    const pendingCount   = await Todo.countDocuments({ userId, completed: false, deleted: false });

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const todayCount   = await Todo.countDocuments({ userId, deleted: false, date: { $gte: startOfDay, $lt: endOfDay } });
    const deletedCount = await Todo.countDocuments({ userId, deleted: true });

    res.send({ allCount, starredCount, completedCount, pendingCount, todayCount, deletedCount });
  } catch (error) {
    console.error("Error fetching todo counts:", error);
    res.status(500).send({ status: false, message: "Internal server error while fetching counts" });
  }
}

/**
 * getActivityData — returns the streak activity map.
 *
 * Strategy (graceful migration):
 *   1. Query StreakEntry for all entries for this user → these are 100% accurate.
 *   2. For any day NOT in StreakEntry (legacy data before migration), fall back
 *      to counting completed tasks in the Todo collection — using completedAt
 *      and WITHOUT the deleted filter so historical completions aren't lost.
 *   3. Merge the two maps (StreakEntry wins on any conflict).
 *
 * This means existing users keep their full history on first deploy, and
 * going forward all new completions are stored in StreakEntry which is
 * immune to task deletions.
 */
async function getActivityData(req, res) {
  const userId = req.id;

  try {
    const now = new Date();
    const oneYearAgo = new Date(now);
    oneYearAgo.setFullYear(now.getFullYear() - 1);
    oneYearAgo.setHours(0, 0, 0, 0);

    // ── Step 1: Read from immutable StreakEntry store ────────────────────────
    const streakEntries = await StreakEntry.find({
      userId: userId.toString(),
      dateKey: {
        $gte: `${oneYearAgo.getFullYear()}-${String(oneYearAgo.getMonth() + 1).padStart(2, "0")}-${String(oneYearAgo.getDate()).padStart(2, "0")}`,
      },
    }).lean();

    const streakMap = {};
    streakEntries.forEach((entry) => {
      if (entry.count > 0) streakMap[entry.dateKey] = entry.count;
    });

    // ── Step 2: Migration fallback — fill gaps from Todo collection ──────────
    // Only query days that are NOT already in streakMap (avoid double counting)
    // Note: deleted: false is intentionally REMOVED so historical completions
    //       aren't lost when tasks are deleted. This is the core bug fix.
    const legacyActivity = await Todo.aggregate([
      {
        $match: {
          userId: userId.toString(),
          completed: true,
          // NO "deleted: false" filter — completion is historical fact
          $or: [
            { completedAt: { $gte: oneYearAgo } },
            { completedAt: null, updatedAt: { $gte: oneYearAgo } },
          ],
        },
      },
      {
        $addFields: {
          effectiveDate: { $ifNull: ["$completedAt", "$updatedAt"] },
        },
      },
      {
        $group: {
          _id: {
            year:  { $year:  "$effectiveDate" },
            month: { $month: "$effectiveDate" },
            day:   { $dayOfMonth: "$effectiveDate" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
    ]);

    // Merge: StreakEntry takes precedence (it is the source of truth for new data)
    legacyActivity.forEach((entry) => {
      const { year, month, day } = entry._id;
      const dateKey = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      // Only use legacy data if StreakEntry doesn't have a record for this day
      if (!(dateKey in streakMap)) {
        streakMap[dateKey] = entry.count;
      }
    });

    // ── Step 3: totalCompleted — count all completions, including deleted tasks ─
    // Sum from StreakEntry (most accurate) + count tasks completed before StreakEntry
    // was introduced (legacy Todo tasks that never had a StreakEntry written)
    const streakTotal = streakEntries.reduce((sum, e) => sum + (e.count || 0), 0);

    // For legacy data: count completed tasks whose completedAt is before the
    // earliest StreakEntry for this user (i.e., before we started tracking)
    const earliestStreakEntry = streakEntries.length > 0
      ? streakEntries.sort((a, b) => a.dateKey.localeCompare(b.dateKey))[0].dateKey
      : null;

    let legacyTotal = 0;
    if (earliestStreakEntry) {
      // Parse the earliest dateKey into a Date
      const [ey, em, ed] = earliestStreakEntry.split("-").map(Number);
      const cutoff = new Date(ey, em - 1, ed, 0, 0, 0, 0);
      legacyTotal = await Todo.countDocuments({
        userId,
        completed: true,
        // Count completed tasks before StreakEntry tracking started
        $or: [
          { completedAt: { $lt: cutoff } },
          { completedAt: null, updatedAt: { $lt: cutoff } },
        ],
      });
    } else {
      // No StreakEntry data at all — this user pre-dates the new system
      // Fall back to simple count (without deleted filter — historical fact)
      legacyTotal = await Todo.countDocuments({ userId, completed: true });
    }

    const totalCompleted = streakTotal + legacyTotal;

    res.send({
      status: true,
      activity: streakMap,
      totalCompleted,
    });
  } catch (error) {
    console.error("Error fetching activity data:", error);
    res.status(500).send({
      status: false,
      message: "Internal server error while fetching activity data",
    });
  }
}

module.exports = {
  showAllTasks,
  showCompletedTasks,
  showStarredTasks,
  showTasksCreatedToday,
  showTasksCreatedWeekAgo,
  showDeletedTask,
  getTodoCounts,
  getActivityData,
};
