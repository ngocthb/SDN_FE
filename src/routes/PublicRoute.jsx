import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  return !isAuthenticated ? (
    children
  ) : (
    <Navigate to="/home" state={{ from: location }} replace />
  );
};

export default PublicRoute;
