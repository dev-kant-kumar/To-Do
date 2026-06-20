const mongoose = require("mongoose");
const Schema = mongoose.Schema;

/**
 * StreakEntry — immutable productivity event log.
 *
 * One document per (userId, dateKey). Records how many tasks
 * the user completed on a given calendar day.
 *
 * KEY DESIGN PRINCIPLE:
 *   - completedAt a task  →  increment count (min 1)
 *   - unMarkComplete       →  decrement count (floor 0)
 *   - deleteTask           →  NO CHANGE — deletion never rewrites history
 *
 * This separates task lifecycle from productivity history, which is
 * how industry streak systems (Duolingo, GitHub, Habitica) work.
 */
const StreakEntrySchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    // Calendar day in UTC ISO format: "2026-06-20"
    dateKey: {
      type: String,
      required: true,
      match: /^\d{4}-\d{2}-\d{2}$/,
    },
    // How many tasks were completed (net of un-completions) on this day
    count: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true }
);

// Compound unique index — one entry per user per day
StreakEntrySchema.index({ userId: 1, dateKey: 1 }, { unique: true });

module.exports = mongoose.model("StreakEntry", StreakEntrySchema);
