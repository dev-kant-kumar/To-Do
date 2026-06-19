import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function toDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function computeStreaks(activityMap) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Current streak: walk back from today (or yesterday if today is empty)
  let currentStreak = 0;
  let cursor = new Date(today);
  const todayKey = toDateKey(today);
  if (!(activityMap[todayKey] && activityMap[todayKey] > 0)) {
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayKey = toDateKey(yesterday);
    if (activityMap[yesterdayKey] && activityMap[yesterdayKey] > 0) {
      cursor = yesterday;
    }
  }
  while (true) {
    const key = toDateKey(cursor);
    if (activityMap[key] && activityMap[key] > 0) {
      currentStreak++;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }

  // Longest streak over past year
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

// ─── Async Thunk ─────────────────────────────────────────────────────────────

export const fetchStreakData = createAsyncThunk(
  "streak/fetchStreakData",
  async (_, { rejectWithValue }) => {
    const token = localStorage.getItem("token");
    if (!token) return rejectWithValue("No token");
    try {
      const apiUrl = import.meta.env.VITE_API_BASE_URL;
      const res = await axios.post(
        `${apiUrl}filters/activity`,
        {},
        { headers: { "X-Authorization": `Bearer ${token}` } }
      );
      if (res.data?.status === true) {
        const activityMap = res.data.activity || {};
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

// ─── Slice ───────────────────────────────────────────────────────────────────

const StreakSlice = createSlice({
  name: "streak",
  initialState: {
    currentStreak: 0,
    longestStreak: 0,
    totalCompleted: 0,
    activityMap: {},
    isLoading: false,
    lastFetched: null,
  },
  reducers: {
    clearStreakData(state) {
      state.currentStreak = 0;
      state.longestStreak = 0;
      state.totalCompleted = 0;
      state.activityMap = {};
      state.lastFetched = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchStreakData.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchStreakData.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentStreak = action.payload.currentStreak;
        state.longestStreak = action.payload.longestStreak;
        state.totalCompleted = action.payload.totalCompleted;
        state.activityMap = action.payload.activityMap;
        state.lastFetched = Date.now();
      })
      .addCase(fetchStreakData.rejected, (state) => {
        state.isLoading = false;
      });
  },
});

export default StreakSlice.reducer;
export const { clearStreakData } = StreakSlice.actions;
