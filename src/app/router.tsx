import { createBrowserRouter, Navigate } from "react-router";

import { Layout } from "../components/Layout";
import { Layout as AdminLayout } from "../features/admin/components/Layout";
import { ProtectedRoute } from "../features/admin/components/ProtectedRoute";
import { ConfiguracaoPage } from "../features/admin/pages/ConfiguracaoPage";
import { DashboardPage } from "../features/admin/pages/DashboardPage";
import { LoginPage } from "../features/admin/pages/LoginPage";
import { PedidoAdminPage } from "../features/admin/pages/PedidoAdminPage";
import { PizzasPage } from "../features/admin/pages/PizzasPage";
import { CardapioPage } from "../features/loja/pages/CardapioPage";
import { HomePage } from "../pages/HomePage";
import { NotFoundPage } from "../pages/NotFoundPage";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: HomePage },
      { path: "cardapio", Component: CardapioPage },
      { path: "*", Component: NotFoundPage },
    ],
  },
  {
    path: "/admin/login",
    Component: LoginPage,
  },
  {
    path: "/admin",
    Component: ProtectedRoute,
    children: [
      {
        Component: AdminLayout,
        children: [
          {
            index: true,
            element: <Navigate to="dashboard" replace />,
          },
          {
            path: "dashboard",
            Component: DashboardPage,
          },
          {
            path: "pizzas",
            Component: PizzasPage,
          },
          {
            path: "pedidos",
            Component: PedidoAdminPage,
          },
          {
            path: "configuracao",
            Component: ConfiguracaoPage,
          },
        ],
      },
    ],
  },
]);
