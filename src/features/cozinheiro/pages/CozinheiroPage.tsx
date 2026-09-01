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

  if (carregando) {
    return <p>Carregando pedidos da cozinha...</p>;
  }

  if (erro) {
    return <p role="alert">{erro}</p>;
  }

  return (
    <main>
      <h1>Cozinha</h1>

      <p>Pedidos aguardando confirmação ou início do preparo.</p>

      {pedidos.length === 0 ? (
        <p>Nenhum pedido aguardando preparo.</p>
      ) : (
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
  );
}
