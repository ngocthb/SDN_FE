import { createSlice } from "@reduxjs/toolkit";
import {
  fetchLoginThunk,
  fetchRegisterThunk,
  fetchVerifyOTPThunk,
  fetchForgetPasswordThunk,
  fetchResetPasswordThunk,
} from "./userThunk";

const userSlice = createSlice({
  name: "user",
  initialState: {
    user: null,
    loading: false,
    error: null,
    isVerified: false,
  },
  reducers: {
    logoutUser: (state) => {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("userId");
      state.user = null;
      state.isVerified = false;
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
        state.isVerified = action.payload.status;
      })
      .addCase(fetchLoginThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchRegisterThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRegisterThunk.fulfilled, (state) => {
        state.loading = false;
        state.isVerified = false;
      })
      .addCase(fetchRegisterThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchVerifyOTPThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVerifyOTPThunk.fulfilled, (state) => {
        state.loading = false;
        state.isVerified = true;
      })
      .addCase(fetchVerifyOTPThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchForgetPasswordThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchForgetPasswordThunk.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(fetchForgetPasswordThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchResetPasswordThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchResetPasswordThunk.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(fetchResetPasswordThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { logoutUser } = userSlice.actions;

export default userSlice.reducer;