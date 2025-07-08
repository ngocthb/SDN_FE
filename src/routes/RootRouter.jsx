import { Routes, Route, Navigate } from "react-router-dom";

import Login from "../pages/Login";
import Register from "../pages/Register";
import Homepage from "../pages/Homepage";
import Messenger from "../pages/Messenger";
import AdminMembershipPage from "../pages/admin/AdminMembershipPage";

import PublicRoute from "./PublicRoute";
import CoachRoute from "./CoachRoute";
import AdminRoute from "./AdminRoute";
import AdminFeedbackPage from "../pages/admin/feedback/AdminFeedbackPage";
import AdminRatingPage from "../pages/admin/rating/AdminRatingPage";
import AdminUserPage from "../pages/admin/user/AdminUserPage";
import AdminDashboard from "../pages/admin/dashboard/AdminDashboard";

const RootRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/home" />} />
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
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
