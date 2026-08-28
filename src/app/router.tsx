import { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";

import { Layout } from "../components/Layout";
import { Layout as AdminLayout } from "../features/admin/components/Layout";
import { ProtectedRoute } from "../features/admin/components/ProtectedRoute";
import { Loading } from "../components/Loading";

const ConfiguracaoPage = lazy(() =>
  import("../features/admin/pages/ConfiguracaoPage").then((m) => ({
    default: m.ConfiguracaoPage,
  })),
);
const DashboardPage = lazy(() =>
  import("../features/admin/pages/DashboardPage").then((m) => ({
    default: m.DashboardPage,
  })),
);
const LoginPage = lazy(() =>
  import("../features/admin/pages/LoginPage").then((m) => ({
    default: m.LoginPage,
  })),
);
const PedidoAdminPage = lazy(() =>
  import("../features/admin/pages/PedidoAdminPage").then((m) => ({
    default: m.PedidoAdminPage,
  })),
);
const PizzasPage = lazy(() =>
  import("../features/admin/pages/PizzasPage").then((m) => ({
    default: m.PizzasPage,
  })),
);
const AcompanharPedidoPage = lazy(() =>
  import("../features/loja/pages/AcompanharPedidoPage").then((m) => ({
    default: m.AcompanharPedidoPage,
  })),
);
const CardapioPage = lazy(() =>
  import("../features/loja/pages/CardapioPage").then((m) => ({
    default: m.CardapioPage,
  })),
);
const CarrinhoPage = lazy(() =>
  import("../features/loja/pages/CarrinhoPage").then((m) => ({
    default: m.CarrinhoPage,
  })),
);
const CategoriaPage = lazy(() =>
  import("../features/loja/pages/CategoriaPage").then((m) => ({
    default: m.CategoriaPage,
  })),
);
const CheckoutPage = lazy(() =>
  import("../features/loja/pages/CheckoutPage").then((m) => ({
    default: m.CheckoutPage,
  })),
);
const PagamentoPage = lazy(() =>
  import("../features/loja/pages/PagamentoPage").then((m) => ({
    default: m.PagamentoPage,
  })),
);
const PizzaDetalhePage = lazy(() =>
  import("../features/loja/pages/PizzaDetalhePage").then((m) => ({
    default: m.PizzaDetalhePage,
  })),
);
const HomePage = lazy(() =>
  import("../pages/HomePage").then((m) => ({ default: m.HomePage })),
);
const NotFoundPage = lazy(() =>
  import("../pages/NotFoundPage").then((m) => ({
    default: m.NotFoundPage,
  })),
);

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: HomePage },
      { path: "cardapio", Component: CardapioPage },
      { path: "categoria/:categoria", Component: CategoriaPage },
      { path: "pizza/:id", Component: PizzaDetalhePage },
      { path: "carrinho", Component: CarrinhoPage },
      { path: "checkout", Component: CheckoutPage },
      { path: "pagamento", Component: PagamentoPage },
      { path: "acompanhar/:id", Component: AcompanharPedidoPage },
      { path: "*", Component: NotFoundPage },
    ],
  },
  {
    path: "/admin/login",
    element: (
      <Suspense fallback={<Loading />}>
        <LoginPage />
      </Suspense>
    ),
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
