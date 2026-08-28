import { useEffect } from "react";

import { DashboardCard } from "../components/DasboardCard";
import { useAdminPedidos } from "../hooks/useAdminPedidos";

export function DashboardPage() {
  const { pedidos, carregando, erro, carregarPedidos } = useAdminPedidos();

  useEffect(() => {
    carregarPedidos();
  }, [carregarPedidos]);

  const hoje = new Date();

  const pedidosHoje = pedidos.filter((pedido) => {
    const dataPedido = new Date(pedido.createdAt);

    return (
      dataPedido.getDate() === hoje.getDate() &&
      dataPedido.getMonth() === hoje.getMonth() &&
      dataPedido.getFullYear() === hoje.getFullYear()
    );
  });

  const pedidosMes = pedidos.filter((pedido) => {
    const dataPedido = new Date(pedido.createdAt);

    return (
      dataPedido.getMonth() === hoje.getMonth() &&
      dataPedido.getFullYear() === hoje.getFullYear()
    );
  });

  const pedidosEntregues = pedidos.filter(
    (pedido) => pedido.status === "entregue",
  );

  const faturamentoHoje = pedidosHoje.reduce(
    (total, pedido) => total + pedido.total,
    0,
  );

  const faturamentoMes = pedidosMes.reduce(
    (total, pedido) => total + pedido.total,
    0,
  );

  function formatarMoeda(valor: number) {
    return valor.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  if (carregando) {
    return <p>Carregando dashboard...</p>;
  }

  if (erro) {
    return <p role="alert">{erro}</p>;
  }

  return (
    <main>
      <h1>Dashboard</h1>

      <p>Resumo da movimentação da pizzaria.</p>

      <section>
        <DashboardCard
          titulo="Total de pedidos"
          valor={pedidos.length}
          descricao="Pedidos registrados"
        />

        <DashboardCard
          titulo="Pedidos de hoje"
          valor={pedidosHoje.length}
          descricao="Pedidos recebidos hoje"
        />

        <DashboardCard
          titulo="Pedidos entregues"
          valor={pedidosEntregues.length}
          descricao="Pedidos finalizados"
        />

        <DashboardCard
          titulo="Faturamento de hoje"
          valor={formatarMoeda(faturamentoHoje)}
        />

        <DashboardCard
          titulo="Faturamento do mês"
          valor={formatarMoeda(faturamentoMes)}
        />
      </section>
    </main>
  );
}
