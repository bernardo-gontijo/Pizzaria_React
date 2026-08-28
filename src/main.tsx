import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { AuthProvider } from "./features/admin/hooks/AuthContext";
import { AppProviders } from "./app/providers";
import { router } from "./app/router";
import { TenantConfigProvider } from "./context/TenantConfigContext";
import { CartProvider } from "./context/CartContext";
import { registerServiceWorker } from "./pwa/registerServiceWorker";
import "./index.css";

registerServiceWorker();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppProviders>
      <AuthProvider>
        <TenantConfigProvider>
          <CartProvider>
            <RouterProvider router={router} />
          </CartProvider>
        </TenantConfigProvider>
      </AuthProvider>
    </AppProviders>
  </StrictMode>,
);
