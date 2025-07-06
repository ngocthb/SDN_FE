import { Navigate, useLocation } from "react-router-dom";

const AdminRoute = ({ children }) => {
  const location = useLocation();
  const isAdmin = localStorage.getItem("role") === "admin";

  return isAdmin ? (
    children
  ) : (
    <Navigate to="/login" state={{ from: location }} replace />
  );
};

export default AdminRoute;