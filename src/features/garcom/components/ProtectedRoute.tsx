import { Navigate, Outlet } from "react-router-dom";

import { useAuth } from "../hooks/AuthContext";

export function ProtectedRoute() {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/garcom/login" replace />;
  }

  return <Outlet />;
}
