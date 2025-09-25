import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function PrivateRoute() {
  const { isAuthenticated, isReady } = useAuth();
  const loc = useLocation();

  if (!isReady) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: loc }} />;
  }

  return <Outlet />;
}
