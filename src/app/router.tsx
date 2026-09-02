import { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";

import { Layout } from "../components/Layout";
import { Layout as AdminLayout } from "../features/admin/components/Layout";
import { ProtectedRoute } from "../features/admin/components/ProtectedRoute";
import { Layout as GarcomLayout } from "../features/garcom/components/Layout";
import { ProtectedRoute as GarcomProtectedRoute } from "../features/garcom/components/ProtectedRoute";
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
const MesasAdminPage = lazy(() =>
  import("../features/admin/pages/MesasAdminPage").then((m) => ({
    default: m.MesasAdminPage,
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
const BebidasPage = lazy(() =>
  import("../features/loja/pages/BebidasPage").then((m) => ({
    default: m.BebidasPage,
  })),
);
const BebidaDetalhePage = lazy(() =>
  import("../features/loja/pages/BebidaDetalhePage").then((m) => ({
    default: m.BebidaDetalhePage,
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
const MeusPedidosPage = lazy(() =>
  import("../features/loja/pages/MeusPedidosPage").then((m) => ({
    default: m.MeusPedidosPage,
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
const GarcomLoginPage = lazy(() =>
  import("../features/garcom/pages/LoginPage").then((m) => ({
    default: m.LoginPage,
  })),
);

const MesasPage = lazy(() =>
  import("../features/garcom/pages/MesasPage").then((m) => ({
    default: m.MesasPage,
  })),
);

const PedidoMesaPage = lazy(() =>
  import("../features/garcom/pages/PedidoMesaPage").then((m) => ({
    default: m.PedidoMesaPage,
  })),
);

const CozinheiroPage = lazy(() =>
  import("../features/cozinheiro/pages/CozinheiroPage").then((m) => ({
    default: m.CozinheiroPage,
  })),
);
export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: HomePage },
      { path: "cardapio", Component: CardapioPage },
      { path: "bebidas", Component: BebidasPage },
      { path: "bebida/:id", Component: BebidaDetalhePage },
      { path: "categoria/:categoria", Component: CategoriaPage },
      { path: "pizza/:id", Component: PizzaDetalhePage },
      { path: "carrinho", Component: CarrinhoPage },
      { path: "checkout", Component: CheckoutPage },
      { path: "pagamento", Component: PagamentoPage },
      { path: "meus-pedidos", Component: MeusPedidosPage },
      { path: "acompanhar/:id", Component: AcompanharPedidoPage },
      { path: "*", Component: NotFoundPage },
    ],
  },
  {
    path: "/cozinha",
    element: (
      <Suspense fallback={<Loading />}>
        <CozinheiroPage />
      </Suspense>
    ),
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
            path: "mesas",
            Component: MesasAdminPage,
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
  {
    path: "/garcom/login",
    element: (
      <Suspense fallback={<Loading />}>
        <GarcomLoginPage />
      </Suspense>
    ),
  },
  {
    path: "/garcom",
    Component: GarcomProtectedRoute,
    children: [
      {
        Component: GarcomLayout,
        children: [
          {
            index: true,
            element: <Navigate to="mesas" replace />,
          },
          {
            path: "mesas",
            Component: MesasPage,
          },
          {
            path: "mesa/:id",
            Component: PedidoMesaPage,
          },
        ],
      },
    ],
  },
]);
