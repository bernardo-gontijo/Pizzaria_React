import { useEntregadorPedidos } from "../hooks/useEntregadorPedidos";

export function EntregadorEntregas() {
  const { pedidosEntregues, loading, error } = useEntregadorPedidos();

  return (
    <main>
      <h1>Entregas concluídas</h1>
      <p>Histórico dos pedidos finalizados pelo entregador.</p>

      {loading && <p>Carregando entregas...</p>}
      {error && <p className="feedback feedback--erro">{error}</p>}

      {!loading && !error && pedidosEntregues.length === 0 && (
        <p>Nenhuma entrega concluída.</p>
      )}

      {!loading && !error && pedidosEntregues.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>Pedido</th>
              <th>Cliente</th>
              <th>Total</th>
              <th>Entregue em</th>
            </tr>
          </thead>
          <tbody>
            {pedidosEntregues.map((pedido) => (
              <tr key={pedido.id}>
                <td>#{pedido.id.slice(-6)}</td>
                <td>{pedido.cliente.nome}</td>
                <td>
                  {pedido.total.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </td>
                <td>{new Date(pedido.updatedAt).toLocaleString("pt-BR")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
