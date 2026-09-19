import { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";

import { Layout } from "../components/Layout";
import { Loading } from "../components/Loading";

import { Layout as AdminLayout } from "../features/admin/components/Layout";
import { ProtectedRoute } from "../features/admin/components/ProtectedRoute";

import { Layout as GarcomLayout } from "../features/garcom/components/Layout";
import { ProtectedRoute as GarcomProtectedRoute } from "../features/garcom/components/ProtectedRoute";

import { ClienteProtectedRoute } from "../features/loja/components/ClienteProtectedRoute";

import {
  EntregadorDashboard,
  EntregadorEntregas,
  EntregadorLayout,
  EntregadorPedidos,
  EntregadorLoginPage,
  EntregadorProtectedRoute,
} from "../features/entregador";

/* =========================
   ADMIN
========================= */

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

const RelatoriosPage = lazy(() =>
  import("../features/admin/pages/RelatoriosPage").then((m) => ({
    default: m.RelatoriosPage,
  })),
);

const PizzasPage = lazy(() =>
  import("../features/admin/pages/PizzasPage").then((m) => ({
    default: m.PizzasPage,
  })),
);

const BebidasAdminPage = lazy(() =>
  import("../features/admin/pages/BebidasPage").then((m) => ({
    default: m.BebidasPage,
  })),
);

const CombosAdminPage = lazy(() =>
  import("../features/admin/pages/CombosAdminPage").then((m) => ({
    default: m.CombosAdminPage,
  })),
);

const MesasAdminPage = lazy(() =>
  import("../features/admin/pages/MesasAdminPage").then((m) => ({
    default: m.MesasAdminPage,
  })),
);

/* =========================
   LOJA
========================= */

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

const ClienteLoginPage = lazy(() =>
  import("../features/loja/pages/ClienteLoginPage").then((m) => ({
    default: m.ClienteLoginPage,
  })),
);

const ClienteCadastroPage = lazy(() =>
  import("../features/loja/pages/ClienteCadastroPage").then((m) => ({
    default: m.ClienteCadastroPage,
  })),
);

/* =========================
   GERAL
========================= */

const HomePage = lazy(() =>
  import("../pages/HomePage").then((m) => ({
    default: m.HomePage,
  })),
);

const NotFoundPage = lazy(() =>
  import("../pages/NotFoundPage").then((m) => ({
    default: m.NotFoundPage,
  })),
);

/* =========================
   GARÇOM
========================= */

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

/* =========================
   COZINHA
========================= */

const CozinheiroPage = lazy(() =>
  import("../features/cozinheiro/pages/CozinheiroPage").then((m) => ({
    default: m.CozinheiroPage,
  })),
);

/* =========================
   ROTAS
========================= */

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      {
        index: true,
        Component: HomePage,
      },

      /* ROTAS PÚBLICAS DA LOJA */

      {
        path: "cardapio",
        Component: CardapioPage,
      },
      {
        path: "bebidas",
        Component: BebidasPage,
      },
      {
        path: "bebida/:id",
        Component: BebidaDetalhePage,
      },
      {
        path: "categoria/:categoria",
        Component: CategoriaPage,
      },
      {
        path: "pizza/:id",
        Component: PizzaDetalhePage,
      },
      {
        path: "carrinho",
        Component: CarrinhoPage,
      },

      /* ROTAS PROTEGIDAS DO CLIENTE */

      {
        Component: ClienteProtectedRoute,
        children: [
          {
            path: "checkout",
            Component: CheckoutPage,
          },
          {
            path: "pagamento",
            Component: PagamentoPage,
          },
          {
            path: "meus-pedidos",
            Component: MeusPedidosPage,
          },
          {
            path: "acompanhar/:id",
            Component: AcompanharPedidoPage,
          },
        ],
      },

      {
        path: "*",
        Component: NotFoundPage,
      },
    ],
  },

  /* =========================
     LOGIN / CADASTRO DO CLIENTE
     (fora do Layout da loja: sem Header/Footer, mesmo padrão
     visual das telas de login do admin/garçom/entregador)
  ========================= */

  {
    path: "/login",
    element: (
      <Suspense fallback={<Loading />}>
        <ClienteLoginPage />
      </Suspense>
    ),
  },
  {
    path: "/cadastro",
    element: (
      <Suspense fallback={<Loading />}>
        <ClienteCadastroPage />
      </Suspense>
    ),
  },

  /* =========================
     COZINHA
  ========================= */

  {
    path: "/cozinha",
    element: (
      <Suspense fallback={<Loading />}>
        <CozinheiroPage />
      </Suspense>
    ),
  },

  /* =========================
     ADMIN LOGIN
  ========================= */

  {
    path: "/admin/login",
    element: (
      <Suspense fallback={<Loading />}>
        <LoginPage />
      </Suspense>
    ),
  },

  /* =========================
     ADMIN
  ========================= */

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
            path: "bebidas",
            Component: BebidasAdminPage,
          },
          {
            path: "combos",
            Component: CombosAdminPage,
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
            path: "relatorios",
            Component: RelatoriosPage,
          },
          {
            path: "configuracao",
            Component: ConfiguracaoPage,
          },
        ],
      },
    ],
  },

  /* =========================
     GARÇOM LOGIN
  ========================= */

  {
    path: "/garcom/login",
    element: (
      <Suspense fallback={<Loading />}>
        <GarcomLoginPage />
      </Suspense>
    ),
  },

  /* =========================
     GARÇOM
  ========================= */

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

  /* =========================
     ENTREGADOR LOGIN
  ========================= */

  {
    path: "/entregador/login",
    element: (
      <Suspense fallback={<Loading />}>
        <EntregadorLoginPage />
      </Suspense>
    ),
  },

  /* =========================
     ENTREGADOR
  ========================= */

  {
    path: "/entregador",
    Component: EntregadorProtectedRoute,
    children: [
      {
        element: <EntregadorLayout />,
        children: [
          {
            index: true,
            element: <EntregadorDashboard />,
          },
          {
            path: "dashboard",
            element: <EntregadorDashboard />,
          },
          {
            path: "pedidos",
            element: <EntregadorPedidos />,
          },
          {
            path: "entregas",
            element: <EntregadorEntregas />,
          },
        ],
      },
    ],
  },
]);