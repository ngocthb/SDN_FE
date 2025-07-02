import { Routes, Route, Navigate } from "react-router-dom";

import Login from "../pages/Login";
import Register from "../pages/Register";
import Homepage from "../pages/Homepage";
import Messenger from "../pages/Messenger";
import AdminMembershipPage from "../pages/admin/AdminMembershipPage";

import PublicRoute from "./PublicRoute";
import CoachRoute from "./CoachRoute";
import AdminRoute from "./AdminRoute";

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
    </Routes>
  );
};

export default RootRouter;