import { createSlice } from "@reduxjs/toolkit";

import { fetchChatThunk } from "./chatThunk";

const chatSlice = createSlice({
  name: "chat",
  initialState: {
    chats: [],
    loading: false,
    error: null,
  },
  reducers: {
    addChat: (state, action) => {
      state.chats.push(action.payload);
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchChatThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchChatThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.chats = action.payload;
      })
      .addCase(fetchChatThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { addChat } = chatSlice.actions;
export default chatSlice.reducer;
