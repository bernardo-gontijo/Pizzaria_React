import { Navigate, Outlet } from "react-router-dom";

import { useEntregadorAuth } from "../hooks/EntregadorAuthContext";

export function EntregadorProtectedRoute() {
  const { user } = useEntregadorAuth();

  if (!user) {
    return <Navigate to="/entregador/login" replace />;
  }

  return <Outlet />;
}
