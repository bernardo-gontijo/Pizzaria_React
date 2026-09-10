import { Navigate, Outlet } from "react-router-dom";

import { useClienteAuth } from "../hooks/ClienteAuthContext";

export function ClienteProtectedRoute() {
  const { autenticado } = useClienteAuth();

  if (!autenticado) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}