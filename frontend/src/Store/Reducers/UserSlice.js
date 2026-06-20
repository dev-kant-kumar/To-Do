import { createSlice } from "@reduxjs/toolkit";

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
  },
  reducers: {
    setUserInfo(state, action) {
      const { _id, name, username, email, date } = action.payload || {};
      state.userId = _id || "";
      state.name = name || "";
      state.username = username || "";
      state.email = email || "";
      state.dateOfAccountCreation = date || "";

      // Persist to localStorage for offline rehydration
      persistUser({ _id, name, username, email, date });
    },
    clearUserInfo(state) {
      state.userId = "";
      state.name = "";
      state.username = "";
      state.email = "";
      state.dateOfAccountCreation = "";

      // Remove the cache so a truly logged-out user can't bypass auth
      clearPersistedUser();
    },
  },
});

export default UserSlice.reducer;
export const { setUserInfo, clearUserInfo } = UserSlice.actions;
