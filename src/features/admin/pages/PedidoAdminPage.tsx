import { useEffect, useMemo } from "react";
import { ClipboardList, History, Utensils } from "lucide-react";

import { PedidoTable } from "../components/PedidoTable";
import { useAdminPedidos } from "../hooks/useAdminPedidos";

// Mesma definição de "pedidos da cozinha" usada na tela do cozinheiro:
// pendente, confirmado e preparando são os status que ainda representam
// trabalho a ser feito na cozinha.
const STATUS_EM_PREPARO = new Set(["pendente", "confirmado", "preparando"]);

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

  const totalAguardando = useMemo(
    () => pedidos.filter((pedido) => pedido.status === "pendente").length,
    [pedidos],
  );

  const totalCozinha = useMemo(
    () =>
      pedidos
        .filter((pedido) => STATUS_EM_PREPARO.has(pedido.status))
        .reduce(
          (total, pedido) =>
            total +
            pedido.itens.reduce((soma, item) => soma + item.quantity, 0),
          0,
        ),
    [pedidos],
  );

  return (
    <main>
      <div className="pedido-admin-cabecalho">
        <div>
          <h1>Gerenciamento de Pedidos</h1>

          <p>
            Consulte os pedidos recebidos e atualize o status de cada
            pedido.
          </p>
        </div>

        <div className="pedido-admin-cabecalho__badges">
          <div className="pedido-admin-badge pedido-admin-badge--aguardando">
            <History size={18} aria-hidden="true" />
            <div>
              <span>Aguardando</span>
              <strong>{String(totalAguardando).padStart(2, "0")}</strong>
            </div>
          </div>

          <div className="pedido-admin-badge pedido-admin-badge--cozinha">
            <Utensils size={18} aria-hidden="true" />
            <div>
              <span>Total cozinha</span>
              <strong>{String(totalCozinha).padStart(2, "0")}</strong>
            </div>
          </div>
        </div>
      </div>

      {carregando && <p>Carregando pedidos...</p>}

      {erro && (
        <p role="alert">
          {erro}
        </p>
      )}

      {!carregando && !erro && (
        <>
          <section className="admin-pedidos__secao">
            <h2 className="pedido-admin-titulo-secao">
              <span
                className="pedido-admin-titulo-secao__icone"
                aria-hidden="true"
              >
                <ClipboardList size={16} />
              </span>
              Pedidos em andamento
            </h2>

            {pedidosEmAndamento.length > 0 ? (
              <PedidoTable
                pedidos={pedidosEmAndamento}
                onAtualizarStatus={atualizarStatus}
              />
            ) : (
              <p>Nenhum pedido em andamento.</p>
            )}
          </section>

          <section className="admin-pedidos__secao admin-pedidos__secao--concluidos">
            <h2 className="pedido-admin-titulo-secao">
              <span
                className="pedido-admin-titulo-secao__icone"
                aria-hidden="true"
              >
                <ClipboardList size={16} />
              </span>
              Pedidos concluídos
            </h2>

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