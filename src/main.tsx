import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { AuthProvider } from "./features/admin/hooks/AuthContext";
import { AppProviders } from "./app/providers";
import { router } from "./app/router";
import { TenantConfigProvider } from "./context/TenantConfigContext";
import { registerServiceWorker } from "./pwa/registerServiceWorker";
import "./index.css";

registerServiceWorker();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppProviders>
      <AuthProvider>
        <TenantConfigProvider>
          <RouterProvider router={router} />
        </TenantConfigProvider>
      </AuthProvider>
    </AppProviders>
  </StrictMode>,
);