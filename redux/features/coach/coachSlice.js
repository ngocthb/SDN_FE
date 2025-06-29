import { createSlice } from "@reduxjs/toolkit";
import {
  fetchAllChatsThunk,
  fetchChatByIdThunk,
  fetchCreateChatThunk,
} from "./coachThunk";

const coachSlice = createSlice({
  name: "coach",
  initialState: {
    chats: [],
    currentChat: null,
    currentChatMessages: [],
    loading: false,
    error: null,
  },
  reducers: {
    addCurrentMessage: (state, action) => {
      state.currentChatMessages.push(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllChatsThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllChatsThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.chats = action.payload;
        console.log("Fetched chats:", action.payload[0]);
        state.currentChat = action.payload[0] || null;
      })
      .addCase(fetchAllChatsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchChatByIdThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchChatByIdThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.currentChatMessages = action.payload;
      })
      .addCase(fetchChatByIdThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});
export const { addCurrentMessage } = coachSlice.actions;
export default coachSlice.reducer;
