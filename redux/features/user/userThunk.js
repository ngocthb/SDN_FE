import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../../config/axios";

export const fetchLoginThunk = createAsyncThunk(
  "user/fetchLogin",
  async (credentials, thunkAPI) => {
    try {
      const res = await api.post("user/login", credentials);
      const token = res.data.data.token;
      localStorage.setItem("userId", JSON.stringify(res.data.data.user._id));
      localStorage.setItem("token", JSON.stringify(token));
      if (res.data.data.user.isAdmin === true) {
        localStorage.setItem("role", "admin");
      } else if (res.data.data.user.isCoach === true) {
        localStorage.setItem("role", "coach");
      } else {
        localStorage.setItem("role", "user");
      }
      return res.data.data.user;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data.message);
    }
  }
);

export const fetchRegisterThunk = createAsyncThunk(
  "user/fetchRegister",
  async (userData, thunkAPI) => {
    console.log("userData", userData);
    try {
      const res = await api.post("user/register", userData);
      return res.data.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data.message);
    }
  }
);
