// src/redux/features/achievement/achievementSlice.js

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../../config/axios";

// Async thunk để fetch leaderboard
export const fetchLeaderboard = createAsyncThunk(
  "achievement/fetchLeaderboard",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("achievement/topUserAchievement");
      return response.data.data; // Trả về mảng user
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const fetchMyAchievements = createAsyncThunk(
  "achievement/fetchMyAchievements",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("achievement/my-achievements");
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const initialState = {
  leaderboard: [],
  myAchievements: [],
  loading: false,
  error: null,
};

const achievementSlice = createSlice({
  name: "achievement",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchLeaderboard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLeaderboard.fulfilled, (state, action) => {
        state.loading = false;
        state.leaderboard = action.payload;
      })
      .addCase(fetchLeaderboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Không thể tải bảng xếp hạng";
      })

      .addCase(fetchMyAchievements.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyAchievements.fulfilled, (state, action) => {
        state.loading = false;
        state.myAchievements = action.payload;
      })
      .addCase(fetchMyAchievements.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Không thể tải thành tích";
      });
  },
});

export default achievementSlice.reducer;
