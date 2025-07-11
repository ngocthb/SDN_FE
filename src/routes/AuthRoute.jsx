import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

const AuthRoute = ({ children }) => {
  const location = useLocation();
  const token = localStorage.getItem("token");
  const isVerified = useSelector((state) => state.user.isVerified);

  if (!token) {
    return children;
  }

  if (!isVerified && location.pathname !== "/verify-otp") {
    return <Navigate to="/verify-otp" state={{ from: location }} replace />;
  }

  if (location.pathname === "/check-reset-otp" || location.pathname === "/reset-password") {
    const email = location.state?.email;
    const otp = location.state?.otp;

    if (!email || (location.pathname === "/reset-password" && !otp)) {
      return <Navigate to="/forgot-password" state={{ from: location }} replace />;
    }
  }

  return <Navigate to="/home" state={{ from: location }} replace />;
};

export default AuthRoute;