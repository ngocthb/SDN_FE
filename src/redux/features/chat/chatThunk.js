import { createAsyncThunk } from "@reduxjs/toolkit";

import api from "../../../config/axios";

export const fetchChatThunk = createAsyncThunk(
  "chat/fetchChat",
  async (thunkAPI) => {
    try {
      const res = await api.get("chat");
      return res.data.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Something went wrong"
      );
    }
  }
);
