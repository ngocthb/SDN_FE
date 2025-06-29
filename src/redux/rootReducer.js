import { combineReducers } from "@reduxjs/toolkit";

import userReducer from "./features/user/userSlice";

import coachReducer from "./features/coach/coachSlice";
import chatReducer from "./features/chat/chatSlice";

const rootReducer = combineReducers({
  user: userReducer,
  coach: coachReducer,
  chat: chatReducer,
});

export default rootReducer;
