import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { getToken } from "../../utils/auth";

export const fetchLeaderboardData = createAsyncThunk(
  "leaderboard/fetchLeaderboardData",
  async (sortBy, { rejectWithValue }) => {
    const token = getToken();
    if (!token) return rejectWithValue("No token");
    try {
      const apiUrl = import.meta.env.VITE_API_BASE_URL;
      const res = await axios.get(
        `${apiUrl}leaderboard?sortBy=${sortBy || "xp"}`,
        { headers: { "X-Authorization": `Bearer ${token}` } }
      );
      if (res.data?.status === true) {
        return {
          rankings: res.data.rankings || [],
          currentUser: res.data.currentUser || null,
        };
      }
      return rejectWithValue("Failed to fetch leaderboard rankings");
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

const LeaderboardSlice = createSlice({
  name: "leaderboard",
  initialState: {
    rankings: [],
    currentUser: null,
    isLoading: false,
    error: null,
  },
  reducers: {
    clearLeaderboard(state) {
      state.rankings = [];
      state.currentUser = null;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLeaderboardData.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchLeaderboardData.fulfilled, (state, action) => {
        state.isLoading = false;
        state.rankings = action.payload.rankings;
        state.currentUser = action.payload.currentUser;
      })
      .addCase(fetchLeaderboardData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to load leaderboard";
      });
  },
});

export default LeaderboardSlice.reducer;
export const { clearLeaderboard } = LeaderboardSlice.actions;
