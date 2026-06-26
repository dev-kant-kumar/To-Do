import { createSlice } from "@reduxjs/toolkit";
import { getLevelInfo } from "../../utils/gamificationUtils";

const USER_CACHE_KEY = "todo_user_cache";

/**
 * Persist user info to localStorage so the app can rehydrate
 * auth state offline without hitting the network.
 */
function persistUser(userData) {
  try {
    localStorage.setItem(USER_CACHE_KEY, JSON.stringify(userData));
  } catch (_) {
    // Storage full or unavailable — fail silently
  }
}

function clearPersistedUser() {
  try {
    localStorage.removeItem(USER_CACHE_KEY);
  } catch (_) {}
}

/**
 * Load the cached user from localStorage. Returns null if nothing is stored.
 */
export function loadCachedUser() {
  try {
    const raw = localStorage.getItem(USER_CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (_) {
    return null;
  }
}

const UserSlice = createSlice({
  name: "userinfo",
  initialState: {
    userId: "",
    name: "",
    username: "",
    email: "",
    dateOfAccountCreation: "",
    xp: 0,
    level: 1,
    points: 0,
    currentStreak: 0,
  },
  reducers: {
    setUserInfo(state, action) {
      const { _id, name, username, email, date, xp, level, points, currentStreak } = action.payload || {};
      const oldLevel = state.level;
      state.userId = _id || "";
      state.name = name || "";
      state.username = username || "";
      state.email = email || "";
      state.dateOfAccountCreation = date || "";
      state.xp = xp ?? state.xp;
      state.level = level ?? state.level;
      state.points = points ?? state.points;
      state.currentStreak = currentStreak ?? state.currentStreak;

      // If the level has increased, trigger the celebration animation!
      if (oldLevel && state.level > oldLevel) {
        const info = getLevelInfo(state.level);
        setTimeout(() => {
          const ev = new CustomEvent("todo-level-up", {
            detail: {
              level: state.level,
              levelTitle: info.title
            }
          });
          window.dispatchEvent(ev);
        }, 50);
      }

      // Persist to localStorage for offline rehydration
      persistUser({ _id, name, username, email, date, xp, level, points, currentStreak });
    },
    clearUserInfo(state) {
      state.userId = "";
      state.name = "";
      state.username = "";
      state.email = "";
      state.dateOfAccountCreation = "";
      state.xp = 0;
      state.level = 1;
      state.points = 0;
      state.currentStreak = 0;

      // Remove the cache so a truly logged-out user can't bypass auth
      clearPersistedUser();
    },
  },
});

export default UserSlice.reducer;
export const { setUserInfo, clearUserInfo } = UserSlice.actions;
