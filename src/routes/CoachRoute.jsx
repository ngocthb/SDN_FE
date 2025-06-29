import React from "react";
import { Navigate, useLocation } from "react-router-dom";

const CoachRoute = ({ children }) => {
  const location = useLocation();
  const isCoach = localStorage.getItem("role") === "coach";

  return isCoach ? (
    children
  ) : (
    <Navigate to="/login" state={{ from: location }} replace />
  );
};

export default CoachRoute;
