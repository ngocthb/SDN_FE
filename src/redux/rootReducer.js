import { combineReducers } from "@reduxjs/toolkit";

import userReducer from "./features/user/userSlice";

import coachReducer from "./features/coach/coachSlice";
import chatReducer from "./features/chat/chatSlice";

import smokingStatusReducer from "./features/smokingStatus/smokingStatusSlice";
import subscriptionReducer from "./features/subscription/subscriptionSlice";
import quitPlanReducer from "./features/quitPlan/quitPlanSlice";
import progressLogReducer from "./features/progressLog/progressLogSlice";
const rootReducer = combineReducers({
  user: userReducer,
  coach: coachReducer,
  chat: chatReducer,
  smokingStatus: smokingStatusReducer,
  subscription: subscriptionReducer,
  quitPlan: quitPlanReducer,
  progressLog: progressLogReducer,
});

export default rootReducer;
