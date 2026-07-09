/**
 * recurrenceTime.js
 * ─────────────────────────────────────────────────────────────────
 * For recurring tasks the user only picks a time of day; the actual
 * occurrence datetime (used for scheduling, notifications, and the
 * recurrence engine) is derived from the repeat rule + that time.
 */

const pad2 = (n) => String(n).padStart(2, "0");

/** Extract "HH:MM" from a date-like value (defaults to 09:00). */
export function timeOfDayFromDate(dateLike, fallback = "09:00") {
  if (!dateLike) return fallback;
  const d = new Date(dateLike);
  if (isNaN(d.getTime())) return fallback;
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

/**
 * Compute the first (soonest future) occurrence datetime for a recurring
 * rule at the given time of day.
 */
export function computeFirstOccurrence(rec, timeOfDay) {
  const [hh, mm] = String(timeOfDay || "09:00")
    .split(":")
    .map((n) => parseInt(n, 10) || 0);
  const now = new Date();
  const atTime = (base) => {
    const d = new Date(base);
    d.setHours(hh, mm, 0, 0);
    return d;
  };
  const freq = rec && rec.frequency;

  if (freq === "daily") {
    const d = atTime(now);
    if (d <= now) d.setDate(d.getDate() + 1);
    return d;
  }

  if (freq === "weekly") {
    const days =
      rec.daysOfWeek && rec.daysOfWeek.length
        ? [...new Set(rec.daysOfWeek)].sort((a, b) => a - b)
        : [now.getDay()];
    for (let add = 0; add <= 7; add++) {
      const cand = new Date(now);
      cand.setDate(now.getDate() + add);
      cand.setHours(hh, mm, 0, 0);
      if (days.includes(cand.getDay()) && cand > now) return cand;
    }
    const d = atTime(now);
    d.setDate(d.getDate() + 7);
    return d;
  }

  if (freq === "monthly") {
    const d = atTime(now);
    if (d <= now) d.setMonth(d.getMonth() + 1);
    return d;
  }

  return atTime(now);
}

/** True when a recurrence rule is active (not "none"). */
export function isRecurring(rec) {
  return !!(rec && rec.frequency && rec.frequency !== "none");
}

/**
 * Build the { dueDate, reminderAt, recurrence } portion of a task payload
 * from the form's scheduling state.
 *
 * - One-time task: due date and reminder are taken from their pickers.
 * - Recurring task: the occurrence datetime (from the repeat rule + time)
 *   drives both dueDate and reminderAt.
 */
export function buildSchedulePayload(recurrence, dueDate, reminderAt) {
  if (!isRecurring(recurrence)) {
    return {
      dueDate: dueDate ? new Date(dueDate).toISOString() : null,
      reminderAt: reminderAt ? new Date(reminderAt).toISOString() : null,
      recurrence: { frequency: "none", interval: 1, daysOfWeek: [], endDate: null },
    };
  }

  const occ = computeFirstOccurrence(recurrence, recurrence.timeOfDay);
  const iso = occ.toISOString();
  return {
    dueDate: iso,
    reminderAt: iso,
    recurrence: {
      frequency: recurrence.frequency,
      interval: recurrence.interval || 1,
      daysOfWeek: recurrence.daysOfWeek || [],
      endDate: recurrence.endDate || null,
    },
  };
}
