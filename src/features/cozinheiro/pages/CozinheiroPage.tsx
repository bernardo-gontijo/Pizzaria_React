import { useEffect } from "react";

import { PedidoCozinhaCard } from "../components/PedidoCozinhaCard";
import { useCozinheiroPedidos } from "../hooks/useCozinheiroPedidos";

export function CozinheiroPage() {
  const {
    pedidosLocais,
    pedidosDelivery,
    carregando,
    erro,
    carregarPedidos,
    confirmarPedido,
    iniciarPreparo,
    finalizarPreparo,
  } = useCozinheiroPedidos();

  useEffect(() => {
    void carregarPedidos();
  }, [carregarPedidos]);

  const semPedidos = pedidosLocais.length === 0 && pedidosDelivery.length === 0;

  return (
    <div className="admin-layout">
      <header className="admin-sidebar">
        <div className="admin-sidebar__titulo">
          <h2>Área da cozinha</h2>
        </div>

        <p>Preparação de pedidos</p>
      </header>

      <div className="admin-layout__conteudo">
        <main>
          <h1>Cozinha</h1>

          <p>
            Confirme os pedidos, inicie o preparo e marque quando estiverem
            prontos.
          </p>

          {carregando && <p>Carregando pedidos da cozinha...</p>}

          {erro && (
            <p className="feedback feedback--erro" role="alert">
              {erro}
            </p>
          )}

          {!carregando && !erro && semPedidos && (
            <p className="feedback">Nenhum pedido aguardando preparo.</p>
          )}

          {!carregando && !erro && pedidosLocais.length > 0 && (
            <>
              <h2>Pedidos locais</h2>

              <section>
                {pedidosLocais.map((pedido) => (
                  <PedidoCozinhaCard
                    key={pedido.id}
                    pedido={pedido}
                    onConfirmar={confirmarPedido}
                    onIniciarPreparo={iniciarPreparo}
                    onFinalizarPreparo={finalizarPreparo}
                  />
                ))}
              </section>
            </>
          )}

          {!carregando && !erro && pedidosDelivery.length > 0 && (
            <>
              <h2>Pedidos delivery</h2>

              <section>
                {pedidosDelivery.map((pedido) => (
                  <PedidoCozinhaCard
                    key={pedido.id}
                    pedido={pedido}
                    onConfirmar={confirmarPedido}
                    onIniciarPreparo={iniciarPreparo}
                    onFinalizarPreparo={finalizarPreparo}
                  />
                ))}
              </section>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
