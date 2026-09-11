import { useEffect } from "react";

import { PedidoTable } from "../components/PedidoTable";
import { useAdminPedidos } from "../hooks/useAdminPedidos";

export function PedidoAdminPage() {
  const { pedidos, carregando, erro, carregarPedidos, atualizarStatus } =
    useAdminPedidos();

  useEffect(() => {
    carregarPedidos();
  }, [carregarPedidos]);

  const pedidosConcluidos = pedidos.filter(
    (pedido) =>
      pedido.status === "entregue" || pedido.status === "cancelado",
  );

  const pedidosEmAndamento = pedidos.filter(
    (pedido) =>
      pedido.status !== "entregue" && pedido.status !== "cancelado",
  );

  return (
    <main>
      <h1>Gerenciamento de Pedidos</h1>

      <p>
        Consulte os pedidos recebidos e atualize o status de cada pedido.
      </p>

      {carregando && <p>Carregando pedidos...</p>}

      {erro && (
        <p role="alert">
          {erro}
        </p>
      )}

      {!carregando && !erro && (
        <>
          <section className="admin-pedidos__secao">
            <h2>Pedidos em andamento</h2>

            {pedidosEmAndamento.length > 0 ? (
              <PedidoTable
                pedidos={pedidosEmAndamento}
                onAtualizarStatus={atualizarStatus}
              />
            ) : (
              <p>Nenhum pedido em andamento.</p>
            )}
          </section>

          <section className="admin-pedidos__secao">
            <h2>Pedidos concluídos</h2>

            {pedidosConcluidos.length > 0 ? (
              <PedidoTable
                pedidos={pedidosConcluidos}
                onAtualizarStatus={atualizarStatus}
              />
            ) : (
              <p>Nenhum pedido concluído.</p>
            )}
          </section>
        </>
      )}
    </main>
  );
}