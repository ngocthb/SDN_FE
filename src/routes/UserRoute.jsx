import { Navigate, useLocation } from "react-router-dom";

const UserRoute = ({ children }) => {
  const location = useLocation();
  const isUser = localStorage.getItem("role") === "user";

  return isUser ? (
    children
  ) : (
    <Navigate to="/login" state={{ from: location }} replace />
  );
};

export default UserRoute;
