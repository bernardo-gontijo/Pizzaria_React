import { useEffect } from "react";
import { PedidoCozinhaCard } from "../components/PedidoCozinhaCard";
import { useCozinheiroPedidos } from "../hooks/useCozinheiroPedidos";

export function CozinheiroPage() {
  const {
    pedidos,
    carregando,
    erro,
    carregarPedidos,
    confirmarPedido,
    iniciarPreparo,
  } = useCozinheiroPedidos();

  useEffect(() => {
    void carregarPedidos();
  }, [carregarPedidos]);

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

          <p>Pedidos aguardando confirmação ou início do preparo.</p>

          {carregando && <p>Carregando pedidos da cozinha...</p>}

          {erro && (
            <p className="feedback feedback--erro" role="alert">
              {erro}
            </p>
          )}

          {!carregando && !erro && pedidos.length === 0 && (
            <p className="feedback">Nenhum pedido aguardando preparo.</p>
          )}

          {!carregando && !erro && pedidos.length > 0 && (
            <section>
              {pedidos.map((pedido) => (
                <PedidoCozinhaCard
                  key={pedido.id}
                  pedido={pedido}
                  onConfirmar={confirmarPedido}
                  onIniciarPreparo={iniciarPreparo}
                />
              ))}
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
