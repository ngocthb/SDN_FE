import { createAsyncThunk } from "@reduxjs/toolkit";

import api from "../../../config/axios";

export const fetchAllChatsThunk = createAsyncThunk(
  "coach/fetchAllChats",
  async (thunkAPI) => {
    try {
      const res = await api.get("coach");
      return res.data.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data.message);
    }
  }
);

export const fetchChatByIdThunk = createAsyncThunk(
  "coach/fetchChatById",
  async (chatId, thunkAPI) => {
    try {
      const res = await api.get(`coach/${chatId}`);
      return res.data.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data.message);
    }
  }
);

export const fetchCreateChatThunk = createAsyncThunk(
  "coach/fetchCreateChat",
  async ({ chatId, message }, thunkAPI) => {
    try {
      const res = await api.post(`coach/${chatId}`, {
        message,
      });
      return res.data.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Something went wrong"
      );
    }
  }
);
