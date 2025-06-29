import { createSlice } from "@reduxjs/toolkit";
import { fetchLoginThunk, fetchRegisterThunk } from "./userThunk";

const userSlice = createSlice({
  name: "user",
  initialState: {
    user: null,
    loading: false,
    error: null,
  },
  reducers: {
    logoutUser: (state) => {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("userId");
      state.user = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLoginThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLoginThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(fetchLoginThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchRegisterThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRegisterThunk.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(fetchRegisterThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});
export const { logoutUser } = userSlice.actions;

export default userSlice.reducer;
