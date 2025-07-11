import { Routes, Route, Navigate } from "react-router-dom";

import Login from "../pages/Login";
import Register from "../pages/Register";
import Homepage from "../pages/Homepage";
import Messenger from "../pages/Messenger";
import AdminMembershipPage from "../pages/admin/AdminMembershipPage";
import CheckResetOTP from "../pages/CheckResetOTP";

import CoachRoute from "./CoachRoute";
import PrivateRoute from "./PrivateRoute";
import Profile from "../pages/Profile";
import AdminRoute from "./AdminRoute";

import AdminFeedbackPage from "../pages/admin/feedback/AdminFeedbackPage";
import AdminRatingPage from "../pages/admin/rating/AdminRatingPage";
import AdminUserPage from "../pages/admin/user/AdminUserPage";
import AdminDashboard from "../pages/admin/dashboard/AdminDashboard";

import AuthRoute from "./AuthRoute";
import VerifyOTP from "../pages/VerifyOTP";
import ForgotPassword from "../pages/ForgotPassword";
import ResetPassword from "../pages/ResetPassword";

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
        path="/check-reset-otp"
        element={
          <AuthRoute>
            <CheckResetOTP />
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
        path="/profile"
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
        path="/admin/feedback"
        element={
          <AdminRoute>
            <AdminFeedbackPage />
          </AdminRoute>
        }
      />

      <Route
        path="/admin/ratings"
        element={
          <AdminRoute>
            <AdminRatingPage />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <AdminRoute>
            <AdminUserPage />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/dashboard"
        element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        }
      />
    </Routes>
  );
};

export default RootRouter;
