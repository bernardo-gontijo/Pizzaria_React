import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";

import { AuthProvider } from "./features/admin/hooks/AuthContext";
import { AuthProvider as GarcomAuthProvider } from "./features/garcom/hooks/AuthContext";
import { ClienteAuthProvider } from "./features/loja/hooks/ClienteAuthContext";
import { EntregadorAuthProvider } from "./features/entregador/hooks/EntregadorAuthContext";

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
        <GarcomAuthProvider>
          <EntregadorAuthProvider>
            <TenantConfigProvider>
              <ClienteAuthProvider>
                <CartProvider>
                  <RouterProvider router={router} />
                </CartProvider>
              </ClienteAuthProvider>
            </TenantConfigProvider>
          </EntregadorAuthProvider>
        </GarcomAuthProvider>
      </AuthProvider>
    </AppProviders>
  </StrictMode>,
);
