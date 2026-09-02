import { useEntregadorPedidos } from "../hooks/useEntregadorPedidos";

export function EntregadorDashboard() {
  const { pedidosProntos, pedidosEmRota, pedidosEntregues, loading, error } =
    useEntregadorPedidos();

  return (
    <main>
      <h1>Dashboard do entregador</h1>
      <p>Visão geral dos pedidos de delivery.</p>

      {loading && <p>Carregando resumo...</p>}
      {error && <p className="feedback feedback--erro">{error}</p>}

      {!loading && !error && (
        <section>
          <article>
            <h3>Prontos para retirar</h3>
            <strong>{pedidosProntos.length}</strong>
          </article>
          <article>
            <h3>Em rota</h3>
            <strong>{pedidosEmRota.length}</strong>
          </article>
          <article>
            <h3>Entregas realizadas</h3>
            <strong>{pedidosEntregues.length}</strong>
          </article>
        </section>
      )}
    </main>
  );
}
