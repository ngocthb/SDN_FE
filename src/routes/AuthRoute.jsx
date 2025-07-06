import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

const AuthRoute = ({ children }) => {
  const location = useLocation();
  const token = localStorage.getItem("token");
  const isVerified = useSelector((state) => state.user.isVerified);

  if (!token) {
    return children;
  }

  if (!isVerified) {
    return <Navigate to="/verify-otp" state={{ from: location }} replace />;
  }

  return <Navigate to="/home" state={{ from: location }} replace />;
};

export default AuthRoute;