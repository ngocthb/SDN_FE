import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Login from "../pages/Login";
import Register from "../pages/Register";
import Homepage from "../pages/Homepage";
import Messenger from "../pages/Messenger";

import PublicRoute from "./PublicRoute";
import CoachRoute from "./CoachRoute";

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
    </Routes>
  );
};

export default RootRouter;
