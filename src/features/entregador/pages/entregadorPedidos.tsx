import { PedidoEntregadorCard } from "../components/pedidoEntregadorCard";
import { useEntregadorPedidos } from "../hooks/useEntregadorPedidos";

export function EntregadorPedidos() {
  const {
    pedidosProntos,
    pedidosEmRota,
    loading,
    error,
    pedidoAtualizando,
    saiuParaEntrega,
    marcarEntregue,
  } = useEntregadorPedidos();

  return (
    <main>
      <h1>Pedidos para entrega</h1>
      <p>Retire os pedidos prontos e acompanhe os que já estão em rota.</p>

      {loading && <p>Carregando pedidos...</p>}
      {error && <p className="feedback feedback--erro">{error}</p>}

      {!loading && !error && (
        <>
          <h2>Prontos para retirar</h2>
          {pedidosProntos.length === 0 ? (
            <p>Nenhum pedido pronto para entrega.</p>
          ) : (
            <section className="entregador-pedidos__lista">
              {pedidosProntos.map((pedido) => (
                <PedidoEntregadorCard
                  key={pedido.id}
                  pedido={pedido}
                  tipo="pronto"
                  atualizando={pedidoAtualizando === pedido.id}
                  onAction={saiuParaEntrega}
                />
              ))}
            </section>
          )}

          <h2>Em rota</h2>
          {pedidosEmRota.length === 0 ? (
            <p>Nenhum pedido em rota.</p>
          ) : (
            <section className="entregador-pedidos__lista">
              {pedidosEmRota.map((pedido) => (
                <PedidoEntregadorCard
                  key={pedido.id}
                  pedido={pedido}
                  tipo="emRota"
                  atualizando={pedidoAtualizando === pedido.id}
                  onAction={marcarEntregue}
                />
              ))}
            </section>
          )}
        </>
      )}
    </main>
  );
}
