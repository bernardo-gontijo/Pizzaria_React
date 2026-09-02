import { useEffect } from "react";

import { PedidoCozinhaCard } from "../components/PedidoCozinhaCard";
import { useCozinheiroPedidos } from "../hooks/useCozinheiroPedidos";

export function CozinheiroPage() {
  const {
    pedidosLocais,
    pedidosDelivery,
    resumo,
    carregando,
    erro,
    pedidoAtualizando,
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

          <section>
            <article>
              <h2>Aguardando</h2>
              <strong>{resumo.pendentes}</strong>
            </article>

            <article>
              <h2>Confirmados</h2>
              <strong>{resumo.confirmados}</strong>
            </article>

            <article>
              <h2>Em preparo</h2>
              <strong>{resumo.preparando}</strong>
            </article>

            <article>
              <h2>Total na cozinha</h2>
              <strong>{resumo.total}</strong>
            </article>
          </section>

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
                    atualizando={pedidoAtualizando === pedido.id}
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
                    atualizando={pedidoAtualizando === pedido.id}
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
