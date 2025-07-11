import { Routes, Route, Navigate } from "react-router-dom";

import Login from "../pages/Login";
import Register from "../pages/Register";
import Homepage from "../pages/Homepage";
import Messenger from "../pages/Messenger";
import AdminMembershipPage from "../pages/admin/AdminMembershipPage";
import CheckResetOTP from "../pages/CheckResetOTP";
import SmokingStatus from "../pages/user/SmokingStatus";
import Statistics from "../pages/user/Statistic";
import QuitPlan from "../pages/user/QuitPlan";
import ProgressLog from "../pages/user/ProgressLog";

import CoachRoute from "./CoachRoute";
import PrivateRoute from "./PrivateRoute";
import Profile from "../pages/Profile";
import AdminRoute from "./AdminRoute";
import AuthRoute from "./AuthRoute";
import UserRoute from "./UserRoute";
import VerifyOTP from "../pages/VerifyOTP";
import ForgotPassword from "../pages/ForgotPassword";
import ResetPassword from "../pages/ResetPassword";
import MembershipPage from "../pages/MembershipPage";
import PaymentSuccessPage from "../pages/PaymentSuccessPage";
import PaymentFailedPage from "../pages/PaymentFailedPage";
import MyMembershipPage from "../pages/MyMembershipPage";

const RootRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/home" />} />
      <Route
        path="/login"
        element={
          <AuthRoute>
            <Login />
          </AuthRoute>
        }
      />
      <Route
        path="/register"
        element={
          <AuthRoute>
            <Register />
          </AuthRoute>
        }
      />
      <Route
        path="/verify-otp"
        element={
          <AuthRoute>
            <VerifyOTP />
          </AuthRoute>
        }
      />
      <Route
        path="/forgot-password"
        element={
          <AuthRoute>
            <ForgotPassword />
          </AuthRoute>
        }
      />

      <Route
        path="/reset-password"
        element={
          <AuthRoute>
            <ResetPassword />
          </AuthRoute>
        }
      />
      <Route
        path="/check-reset-otp"
        element={
          <AuthRoute>
            <CheckResetOTP />
          </AuthRoute>
        }
      />
      <Route path="/home" element={<Homepage />} />
      <Route
        path="/messenger"
        element={
          <CoachRoute>
            <Messenger />
          </CoachRoute>
        }
      />
      <Route
        path="profile"
        element={
          <PrivateRoute>
            <Profile />
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/memberships"
        element={
          <AdminRoute>
            <AdminMembershipPage />
          </AdminRoute>
        }
      />
      <Route
        path="/smoking-status"
        element={
          <UserRoute>
            <SmokingStatus />
          </UserRoute>
        }
      />
      <Route
        path="/statistics"
        element={
          <UserRoute>
            <Statistics />
          </UserRoute>
        }
      />
      <Route
        path="/quit-plan"
        element={
          <UserRoute>
            <QuitPlan />
          </UserRoute>
        }
      />
      <Route
        path="/progress-log"
        element={
          <UserRoute>
            <ProgressLog />
          </UserRoute>
        }
      />

      <Route
        path="/user/membership"
        element={
          <UserRoute>
            <MembershipPage />
          </UserRoute>
        }
      />

      <Route
        path="/user/payment/success"
        element={
          <UserRoute>
            <PaymentSuccessPage />
          </UserRoute>
        }
      />

      <Route
        path="/user/payment/failed"
        element={
          <UserRoute>
            <PaymentFailedPage />
          </UserRoute>
        }
      />

      <Route
        path="/user/my-membership"
        element={
          <UserRoute>
            <MyMembershipPage />
          </UserRoute>
        }
      />
    </Routes>
  );
};

export default RootRouter;
