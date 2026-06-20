import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-toastify";
import { getToken } from "../../utils/auth";

// ─── Milestone definitions ────────────────────────────────────────────────────
export const STREAK_MILESTONES = [
  { days: 3,   badge: "Starter Spark",     emoji: "✨" },
  { days: 7,   badge: "Week Warrior",      emoji: "🏆" },
  { days: 14,  badge: "Fortnight Force",   emoji: "⚡" },
  { days: 30,  badge: "Monthly Master",    emoji: "💎" },
  { days: 100, badge: "Century Centurion", emoji: "🔱" },
  { days: 365, badge: "Legendary Streak",  emoji: "👑" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Computes currentStreak and longestStreak from a flat activity map.
 *
 * currentStreak:
 *   Walk back from today. If today has activity, count consecutive days
 *   backwards until a gap. If today has no activity, check yesterday —
 *   if yesterday has activity, count from yesterday. This allows a
 *   one-day grace window during the day (streak not broken until
 *   midnight of the day after you last completed).
 *
 * longestStreak:
 *   Linear scan over the past year, tracking the maximum consecutive
 *   run of active days.
 */
export function computeStreaks(activityMap) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayKey = toDateKey(today);

  // ── Current streak ─────────────────────────────────────────────────────────
  let currentStreak = 0;
  let cursor = new Date(today);

  // Start from yesterday if today has no completions yet
  if (!(activityMap[todayKey] && activityMap[todayKey] > 0)) {
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayKey = toDateKey(yesterday);
    if (activityMap[yesterdayKey] && activityMap[yesterdayKey] > 0) {
      cursor = yesterday;
    }
    // If neither today nor yesterday has activity — streak is 0
  }

  // Walk backwards counting consecutive active days
  while (true) {
    const key = toDateKey(cursor);
    if (activityMap[key] && activityMap[key] > 0) {
      currentStreak++;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }

  // ── Longest streak (past year) ─────────────────────────────────────────────
  let longestStreak = 0;
  let tempStreak = 0;
  const startDay = new Date(today);
  startDay.setDate(today.getDate() - 365);
  let scanCursor = new Date(startDay);

  while (scanCursor <= today) {
    const key = toDateKey(scanCursor);
    if (activityMap[key] && activityMap[key] > 0) {
      tempStreak++;
      longestStreak = Math.max(longestStreak, tempStreak);
    } else {
      tempStreak = 0;
    }
    scanCursor.setDate(scanCursor.getDate() + 1);
  }

  return { currentStreak, longestStreak };
}

/**
 * Returns the next unearned milestone above the given streak count,
 * or null if all milestones have been achieved.
 */
function getNextMilestone(streak) {
  return STREAK_MILESTONES.find((m) => m.days > streak) || null;
}

/**
 * Checks if crossing from `oldStreak` to `newStreak` hits a milestone.
 * Returns the milestone if so, null otherwise.
 */
function checkMilestoneReached(oldStreak, newStreak) {
  return (
    STREAK_MILESTONES.find((m) => m.days > oldStreak && m.days <= newStreak) ||
    null
  );
}

// ─── Async Thunk ──────────────────────────────────────────────────────────────

export const fetchStreakData = createAsyncThunk(
  "streak/fetchStreakData",
  async (_, { rejectWithValue }) => {
    const token = getToken();
    if (!token) return rejectWithValue("No token");
    try {
      const apiUrl = import.meta.env.VITE_API_BASE_URL;
      const res = await axios.post(
        `${apiUrl}filters/activity`,
        {},
        { headers: { "X-Authorization": `Bearer ${token}` } }
      );
      if (res.data?.status === true) {
        const activityMap    = res.data.activity || {};
        const totalCompleted = res.data.totalCompleted || 0;
        const { currentStreak, longestStreak } = computeStreaks(activityMap);
        return { activityMap, totalCompleted, currentStreak, longestStreak };
      }
      return rejectWithValue("Invalid response");
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// ─── Slice ────────────────────────────────────────────────────────────────────

const StreakSlice = createSlice({
  name: "streak",
  initialState: {
    currentStreak:  0,
    longestStreak:  0,
    totalCompleted: 0,
    activityMap:    {},
    isLoading:      false,
    lastFetched:    null,
    // Track which milestones have been shown this session to avoid repeat toasts
    shownMilestones: [],
  },
  reducers: {
    clearStreakData(state) {
      state.currentStreak  = 0;
      state.longestStreak  = 0;
      state.totalCompleted = 0;
      state.activityMap    = {};
      state.lastFetched    = null;
      state.shownMilestones = [];
    },

    /**
     * Call this immediately when the user completes a task.
     * Updates the local activityMap and recomputes streak optimistically
     * so the UI reflects the change instantly without a server round-trip.
     */
    incrementStreakOptimistic(state) {
      const today = new Date();
      const y = today.getFullYear();
      const m = String(today.getMonth() + 1).padStart(2, "0");
      const d = String(today.getDate()).padStart(2, "0");
      const todayKey = `${y}-${m}-${d}`;

      // Increment today's count in the local map
      const prevCount = state.activityMap[todayKey] || 0;
      state.activityMap = {
        ...state.activityMap,
        [todayKey]: prevCount + 1,
      };
      state.totalCompleted = state.totalCompleted + 1;

      const oldStreak = state.currentStreak;
      const { currentStreak, longestStreak } = computeStreaks(state.activityMap);
      state.currentStreak = currentStreak;
      state.longestStreak = Math.max(state.longestStreak, longestStreak);

      // ── Milestone celebration ────────────────────────────────────────────
      const hit = checkMilestoneReached(oldStreak, currentStreak);
      if (hit && !state.shownMilestones.includes(hit.days)) {
        state.shownMilestones = [...state.shownMilestones, hit.days];
        // We schedule the toast outside Redux (side-effect) via a custom event
        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("todo-streak-milestone", { detail: hit })
          );
        }
      }
    },

    /**
     * Call this when a user un-completes a task completed today.
     * Decrements today's count optimistically.
     */
    decrementStreakOptimistic(state) {
      const today = new Date();
      const y = today.getFullYear();
      const m = String(today.getMonth() + 1).padStart(2, "0");
      const d = String(today.getDate()).padStart(2, "0");
      const todayKey = `${y}-${m}-${d}`;

      const prevCount = state.activityMap[todayKey] || 0;
      const newCount  = Math.max(0, prevCount - 1);

      const newMap = { ...state.activityMap };
      if (newCount === 0) {
        delete newMap[todayKey];
      } else {
        newMap[todayKey] = newCount;
      }
      state.activityMap    = newMap;
      state.totalCompleted = Math.max(0, state.totalCompleted - 1);

      const { currentStreak, longestStreak } = computeStreaks(state.activityMap);
      state.currentStreak = currentStreak;
      state.longestStreak = Math.max(state.longestStreak, longestStreak);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchStreakData.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchStreakData.fulfilled, (state, action) => {
        const oldStreak = state.currentStreak;
        state.isLoading      = false;
        state.currentStreak  = action.payload.currentStreak;
        state.longestStreak  = action.payload.longestStreak;
        state.totalCompleted = action.payload.totalCompleted;
        state.activityMap    = action.payload.activityMap;
        state.lastFetched    = Date.now();

        // Fire milestone toast if server confirms a new streak milestone
        const hit = checkMilestoneReached(oldStreak, action.payload.currentStreak);
        if (hit && !state.shownMilestones.includes(hit.days)) {
          state.shownMilestones = [...state.shownMilestones, hit.days];
          if (typeof window !== "undefined") {
            window.dispatchEvent(
              new CustomEvent("todo-streak-milestone", { detail: hit })
            );
          }
        }
      })
      .addCase(fetchStreakData.rejected, (state) => {
        state.isLoading = false;
      });
  },
});

export default StreakSlice.reducer;
export const {
  clearStreakData,
  incrementStreakOptimistic,
  decrementStreakOptimistic,
} = StreakSlice.actions;
