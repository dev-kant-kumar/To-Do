const Todo = require("../models/todoModel");
const User = require("../models/userModel");
const StreakEntry = require("../models/streakModel");

// ── Streak helpers ────────────────────────────────────────────────────────────

/**
 * Returns today's date key in local server time: "YYYY-MM-DD".
 * We use the server's local date (not UTC) so "today" matches
 * what the user sees in their timezone. If you want UTC, change
 * the formatting below — just keep it consistent everywhere.
 */
function getTodayKey() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Increment today's streak count for a user by 1.
 * Uses upsert so the document is created if it doesn't exist.
 */
async function incrementStreak(userId) {
  const dateKey = getTodayKey();
  await StreakEntry.findOneAndUpdate(
    { userId: userId.toString(), dateKey },
    { $inc: { count: 1 } },
    { upsert: true, new: true }
  );
}

/**
 * Decrement today's streak count for a user by 1 (floor 0).
 * If the document doesn't exist, do nothing.
 */
async function decrementStreak(userId) {
  const dateKey = getTodayKey();
  // First fetch current count so we can floor at 0
  const entry = await StreakEntry.findOne({
    userId: userId.toString(),
    dateKey,
  });
  if (!entry || entry.count <= 0) return; // Nothing to decrement

  await StreakEntry.findOneAndUpdate(
    { userId: userId.toString(), dateKey },
    { $inc: { count: -1 } }
  );
}

// ── Task handlers ─────────────────────────────────────────────────────────────

async function addTask(req, res) {
  const { task, priority, dueDate, description } = req.body;
  const userId = req.id;

  const existingUser = await User.findOne({ _id: userId });
  if (existingUser) {
    const newTask = new Todo({
      userId: userId,
      task: task,
      completed: false,
      starred: false,
      deleted: false,
      date: new Date(),
      priority: priority || "low",
      dueDate: dueDate || null,
      description: description || "",
    });

    await newTask.save();
    res.send({
      status: true,
      message: "Task added successfully",
      todo: newTask,
    });
  } else {
    res.send({
      status: false,
      message: "No such user found!",
    });
  }
}

async function markCompleted(req, res) {
  const { taskID } = req.body;
  const userId = req.id;

  try {
    // Prevent double-counting: only increment streak if task wasn't already completed
    const task = await Todo.findOne({ _id: taskID, userId: userId });
    if (!task) {
      return res.send({ status: false, message: "No such task found!" });
    }

    if (task.completed) {
      // Already completed — idempotent, no streak change
      return res.send({ status: true, message: "Task already completed." });
    }

    const updated = await Todo.findOneAndUpdate(
      { _id: taskID, userId: userId },
      { $set: { completed: true, completedAt: new Date() } },
      { new: true }
    );

    if (updated) {
      // ── Streak: completion is a historical fact — persisted forever ──
      await incrementStreak(userId);
      res.send({ status: true, message: "Task successfully marked as completed." });
    } else {
      res.send({ status: false, message: "No such task found!" });
    }
  } catch (err) {
    console.error("[markCompleted] Error:", err);
    res.status(500).send({ status: false, message: "Internal server error" });
  }
}

async function unMarkCompleted(req, res) {
  const { taskID } = req.body;
  const userId = req.id;

  try {
    const task = await Todo.findOne({ _id: taskID, userId: userId });
    if (!task) {
      return res.send({ status: false, message: "No such task found!" });
    }

    if (!task.completed) {
      // Already not completed — idempotent
      return res.send({ status: true, message: "Task already not completed." });
    }

    const updated = await Todo.findOneAndUpdate(
      { _id: taskID, userId: userId },
      { $set: { completed: false, completedAt: null } },
      { new: true }
    );

    if (updated) {
      // ── Streak: un-completing reverses today's count (not historical days) ──
      // We only decrement if the task was completed today (same dateKey).
      if (task.completedAt) {
        const completedDateKey = (() => {
          const d = new Date(task.completedAt);
          return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
        })();
        const todayKey = getTodayKey();
        // Only decrement if it was completed today — past days are immutable
        if (completedDateKey === todayKey) {
          await decrementStreak(userId);
        }
      }
      res.send({ status: true, message: "Task successfully unmarked as completed." });
    } else {
      res.send({ status: false, message: "No such task found!" });
    }
  } catch (err) {
    console.error("[unMarkCompleted] Error:", err);
    res.status(500).send({ status: false, message: "Internal server error" });
  }
}

async function markStarred(req, res) {
  const { taskID } = req.body;
  const userId = req.id;

  const markStarredStatus = await Todo.findOneAndUpdate(
    { _id: taskID, userId: userId },
    { $set: { starred: true } }
  );

  if (markStarredStatus) {
    res.send({ status: true, message: "Task successfully marked as starred." });
  } else {
    res.send({ status: false, message: "No such task found" });
  }
}

async function unMarkStarred(req, res) {
  const { taskID } = req.body;
  const userId = req.id;

  const unMarkStarredStatus = await Todo.findOneAndUpdate(
    { _id: taskID, userId: userId },
    { $set: { starred: false } }
  );

  if (unMarkStarredStatus) {
    res.send({ status: true, message: "Task successfully unmarked as starred." });
  } else {
    res.send({ status: false, message: "No such task found!" });
  }
}

async function deleteTask(req, res) {
  // ── NO STREAK CHANGES HERE — deletion never rewrites history ──
  const { taskID } = req.body;
  const userId = req.id;

  const deleteStatus = await Todo.findOneAndUpdate(
    { _id: taskID, userId: userId },
    { $set: { deleted: true } }
  );

  if (deleteStatus) {
    res.send({ status: true, message: "Task deleted successfully." });
  } else {
    res.send({ status: false, message: "No such Task found!" });
  }
}

async function undoDelete(req, res) {
  const { taskID } = req.body;
  const userId = req.id;

  const deleteStatus = await Todo.findOneAndUpdate(
    { _id: taskID, userId: userId },
    { $set: { deleted: false } }
  );

  if (deleteStatus) {
    res.send({ status: true, message: "Task successfully restored from deletion." });
  } else {
    res.send({ status: false, message: "No such Task found!" });
  }
}

async function deleteDeletedTask(req, res) {
  // ── NO STREAK CHANGES HERE — permanently deleting tasks never touches history ──
  const userId = req.id;

  try {
    const noOfTaskToDelete = await Todo.find({ userId: userId, deleted: true });

    if (noOfTaskToDelete.length === 0) {
      return res.send({ status: false, message: "No tasks found to delete!" });
    }

    const finalDeleteStatus = await Todo.deleteMany({
      userId: userId,
      deleted: true,
    });

    if (finalDeleteStatus.deletedCount === noOfTaskToDelete.length) {
      res.send({ status: true, message: "All tasks deleted successfully." });
    } else {
      res.send({
        status: false,
        message: "Error deleting tasks. Not all tasks were deleted!",
      });
    }
  } catch (err) {
    console.error("[deleteDeletedTask] Error:", err);
    res.send({ status: false, message: "An error occurred while deleting tasks." });
  }
}

async function updateTask(req, res) {
  const {
    taskID,
    task,
    priority,
    dueDate,
    description,
    completed,
    starred,
    rankIndex,
    startDate,
    endDate,
  } = req.body;
  const userId = req.id;

  if (!taskID) {
    return res.send({ status: false, message: "Task ID is required" });
  }

  try {
    const updateFields = {};
    if (task !== undefined) updateFields.task = task;
    if (priority !== undefined) updateFields.priority = priority;
    if (dueDate !== undefined) updateFields.dueDate = dueDate;
    if (description !== undefined) updateFields.description = description;
    if (starred !== undefined) updateFields.starred = starred;
    if (rankIndex !== undefined) updateFields.rankIndex = rankIndex;
    if (startDate !== undefined) updateFields.startDate = startDate;
    if (endDate !== undefined) updateFields.endDate = endDate;

    // If completion status is changing via updateTask, handle streak correctly
    if (completed !== undefined) {
      const existingTask = await Todo.findOne({ _id: taskID, userId: userId });
      if (existingTask) {
        if (completed === true && !existingTask.completed) {
          updateFields.completed = true;
          updateFields.completedAt = new Date();
          await incrementStreak(userId);
        } else if (completed === false && existingTask.completed) {
          updateFields.completed = false;
          updateFields.completedAt = null;
          // Only decrement if completed today
          if (existingTask.completedAt) {
            const d = new Date(existingTask.completedAt);
            const completedDateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
            if (completedDateKey === getTodayKey()) {
              await decrementStreak(userId);
            }
          }
        }
      }
    }

    const updatedTask = await Todo.findOneAndUpdate(
      { _id: taskID, userId: userId },
      { $set: updateFields },
      { new: true }
    );

    if (updatedTask) {
      res.send({ status: true, message: "Task updated successfully", task: updatedTask });
    } else {
      res.send({ status: false, message: "No such task found!" });
    }
  } catch (err) {
    console.error("[updateTask] Error:", err);
    res.send({ status: false, message: "An error occurred while updating task" });
  }
}

module.exports = {
  addTask,
  markCompleted,
  unMarkCompleted,
  markStarred,
  unMarkStarred,
  deleteTask,
  undoDelete,
  deleteDeletedTask,
  updateTask,
};
