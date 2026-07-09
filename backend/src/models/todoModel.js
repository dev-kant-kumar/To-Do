const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const SubtaskSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    done: { type: Boolean, default: false },
  },
  { _id: false }
);

const TodoSchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    task: {
      type: String,
      required: true,
    },
    completed: {
      type: Boolean,
      required: true,
    },
    starred: {
      type: Boolean,
      required: true,
    },
    deleted: {
      type: Boolean,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "low",
      required: true,
    },
    dueDate: {
      type: Date,
    },
    // Explicit reminder time, independent of the due date. When set, the
    // service worker fires a notification once this moment passes.
    reminderAt: {
      type: Date,
      default: null,
    },
    description: {
      type: String,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    rankIndex: {
      type: Number,
      default: 0,
    },
    // Checklist items belonging to this task.
    subtasks: {
      type: [SubtaskSchema],
      default: [],
    },
    // Free-form labels for organizing/filtering tasks.
    tags: {
      type: [String],
      default: [],
      index: true,
    },
    // Exact XP / points granted when this task was last marked completed.
    // Persisted so un-completing reverses precisely what was awarded, instead
    // of recomputing a streak-dependent value that may have since changed.
    xpAwarded: {
      type: Number,
      default: 0,
    },
    pointsAwarded: {
      type: Number,
      default: 0,
    },
    startDate: {
      type: Date,
      default: null,
    },
    endDate: {
      type: Date,
      default: null,
    },
    // ── Recurrence ──────────────────────────────────────────────────────────
    // When set, completing this task spawns the next occurrence. Completion
    // history is preserved (this task stays completed), which keeps the streak
    // and XP engine working unchanged.
    recurrence: {
      // "none" | "daily" | "weekly" | "monthly"
      frequency: {
        type: String,
        enum: ["none", "daily", "weekly", "monthly"],
        default: "none",
      },
      // Repeat every N days/weeks/months.
      interval: {
        type: Number,
        default: 1,
        min: 1,
      },
      // For weekly recurrence: specific weekdays (0=Sun … 6=Sat). Empty = same
      // weekday as the due date.
      daysOfWeek: {
        type: [Number],
        default: [],
      },
      // Optional last date the series may recur to (inclusive).
      endDate: {
        type: Date,
        default: null,
      },
    },
    // Links a spawned occurrence back to the task whose completion created it,
    // so an un-complete can cleanly remove the untouched child.
    recurrenceParentId: {
      type: String,
      default: null,
    },
    // Set on the parent once it has spawned its next occurrence, preventing
    // duplicate spawns and enabling clean undo.
    recurrenceSpawnedChildId: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Todo", TodoSchema);
