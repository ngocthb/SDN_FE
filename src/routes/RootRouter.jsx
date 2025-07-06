import { Routes, Route, Navigate } from "react-router-dom";

import Login from "../pages/Login";
import Register from "../pages/Register";
import Homepage from "../pages/Homepage";
import Messenger from "../pages/Messenger";
import AdminMembershipPage from "../pages/admin/AdminMembershipPage";
import CheckResetOTP from "../pages/CheckResetOTP";

import PublicRoute from "./PublicRoute";
import CoachRoute from "./CoachRoute";
import AdminRoute from "./AdminRoute";
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
        path="/admin/memberships"
        element={
          <AdminRoute>
            <AdminMembershipPage />
          </AdminRoute>
        }
      />
    </Routes>
  );
};

export default RootRouter;