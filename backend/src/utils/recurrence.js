/**
 * recurrence.js
 * ─────────────────────────────────────────────────────────────────
 * Helpers for recurring tasks.
 *
 * Model: "spawn next on complete". When a recurring task is marked
 * complete it stays completed (preserving history + streak + XP), and
 * a fresh occurrence is created with the due date advanced to the next
 * date in the series. Un-completing removes the untouched spawned child.
 */

const Todo = require("../models/todoModel");

const VALID_FREQ = ["daily", "weekly", "monthly"];

/** True if the task carries an active recurrence rule. */
function isRecurring(task) {
  return !!(task && task.recurrence && VALID_FREQ.includes(task.recurrence.frequency));
}

/**
 * Compute the next occurrence date after `from`, given a recurrence rule.
 * Returns a Date, or null if the series has ended.
 *
 * @param {Date} from       anchor date (usually the task's dueDate, else now)
 * @param {object} rule     { frequency, interval, daysOfWeek, endDate }
 */
function nextOccurrence(from, rule) {
  if (!rule || !VALID_FREQ.includes(rule.frequency)) return null;

  const interval = Math.max(1, rule.interval || 1);
  const base = from ? new Date(from) : new Date();
  let next = new Date(base);

  if (rule.frequency === "daily") {
    next.setDate(next.getDate() + interval);
  } else if (rule.frequency === "weekly") {
    const days = Array.isArray(rule.daysOfWeek) ? [...rule.daysOfWeek].filter((d) => d >= 0 && d <= 6) : [];
    if (days.length > 0) {
      // Find the soonest selected weekday strictly after `base`.
      const sorted = [...new Set(days)].sort((a, b) => a - b);
      let found = null;
      for (let add = 1; add <= 7 && !found; add++) {
        const cand = new Date(base);
        cand.setDate(cand.getDate() + add);
        if (sorted.includes(cand.getDay())) found = cand;
      }
      // If interval > 1, and we've wrapped to the same weekday within a week,
      // push out the remaining whole weeks.
      next = found || (() => {
        const c = new Date(base);
        c.setDate(c.getDate() + 7 * interval);
        return c;
      })();
    } else {
      next.setDate(next.getDate() + 7 * interval);
    }
  } else if (rule.frequency === "monthly") {
    next.setMonth(next.getMonth() + interval);
  }

  if (rule.endDate && next > new Date(rule.endDate)) return null;
  return next;
}

/**
 * Given a just-completed recurring task, create its next occurrence.
 * Idempotent: if a child was already spawned for this completion, does nothing.
 * Returns the newly created child Todo, or null if the series has ended.
 */
async function spawnNextOccurrence(task) {
  if (!isRecurring(task)) return null;
  if (task.recurrenceSpawnedChildId) return null; // already spawned

  const anchor = task.dueDate ? new Date(task.dueDate) : new Date();
  const due = nextOccurrence(anchor, task.recurrence);
  if (!due) return null; // series ended

  // Preserve the offset between startDate and dueDate, if any.
  let startDate = null;
  if (task.startDate && task.dueDate) {
    const offsetMs = new Date(task.dueDate).getTime() - new Date(task.startDate).getTime();
    startDate = new Date(due.getTime() - offsetMs);
  }

  // Advance the reminder alongside the due date, preserving any offset
  // (recurring tasks set reminderAt === dueDate, so it tracks the occurrence).
  let reminderAt = null;
  if (task.reminderAt && task.dueDate) {
    const offsetMs = new Date(task.dueDate).getTime() - new Date(task.reminderAt).getTime();
    reminderAt = new Date(due.getTime() - offsetMs);
  } else if (task.reminderAt) {
    reminderAt = new Date(due);
  }

  const child = new Todo({
    userId: task.userId,
    task: task.task,
    completed: false,
    starred: task.starred,
    deleted: false,
    date: new Date(),
    priority: task.priority,
    dueDate: due,
    description: task.description || "",
    rankIndex: task.rankIndex || 0,
    startDate,
    endDate: null,
    tags: task.tags || [],
    subtasks: Array.isArray(task.subtasks)
      ? task.subtasks.map((s) => ({ title: s.title, done: false }))
      : [],
    reminderAt,
    recurrence: {
      frequency: task.recurrence.frequency,
      interval: task.recurrence.interval,
      daysOfWeek: task.recurrence.daysOfWeek,
      endDate: task.recurrence.endDate,
    },
    recurrenceParentId: task._id.toString(),
  });

  await child.save();

  // Record the link on the parent so we don't spawn twice and can undo.
  await Todo.findByIdAndUpdate(task._id, {
    recurrenceSpawnedChildId: child._id.toString(),
  });

  return child;
}

/**
 * Reverse a spawn when a recurring task is un-completed. Removes the spawned
 * child only if it hasn't been touched (not completed, not deleted), so we
 * never destroy work the user has since done on the next occurrence.
 */
async function removeSpawnedOccurrence(task) {
  if (!task || !task.recurrenceSpawnedChildId) return;

  const child = await Todo.findById(task.recurrenceSpawnedChildId);
  if (child && !child.completed && !child.deleted) {
    await Todo.deleteOne({ _id: child._id });
  }
  await Todo.findByIdAndUpdate(task._id, { recurrenceSpawnedChildId: null });
}

module.exports = {
  isRecurring,
  nextOccurrence,
  spawnNextOccurrence,
  removeSpawnedOccurrence,
};
