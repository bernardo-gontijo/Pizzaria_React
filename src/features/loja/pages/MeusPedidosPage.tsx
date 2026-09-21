import { useEffect } from "react";
import { Link } from "react-router-dom";

import { MeuPedidoCard } from "../components/MeuPedidoCard";
import { useMeusPedidos } from "../hooks/useMeusPedidos";

export function MeusPedidosPage() {
  const { pedidos, loading, erro, carregarPedidos } = useMeusPedidos();

  useEffect(() => {
    void carregarPedidos();
  }, [carregarPedidos]);

  const pedidosEmAndamento = pedidos.filter(
    (pedido) => pedido.status !== "entregue" && pedido.status !== "cancelado",
  );

  const pedidosEntregues = pedidos.filter(
    (pedido) => pedido.status === "entregue",
  );

  const pedidosCancelados = pedidos.filter(
    (pedido) => pedido.status === "cancelado",
  );

  return (
    <section className="pagina-loja meus-pedidos-page">
      <h1>Meus pedidos</h1>

      <p className="pagina-loja__introducao">
        Consulte seu histórico de pedidos e acompanhe o preparo de cada um.
      </p>

      {loading && <p className="feedback">Carregando seus pedidos...</p>}

      {erro && <p className="feedback feedback--erro">{erro}</p>}

      {!loading && !erro && pedidos.length === 0 && (
        <div className="meus-pedidos-vazio">
          <p>Você ainda não possui pedidos.</p>

          <Link className="botao" to="/cardapio">
            Ver cardápio
          </Link>
        </div>
      )}

      {!loading && !erro && pedidos.length > 0 && (
        <>
          <section>
            <h2>Pedidos em andamento</h2>

            {pedidosEmAndamento.length === 0 ? (
              <p className="feedback">Você não possui pedidos em andamento.</p>
            ) : (
              <div className="meus-pedidos-lista">
                {pedidosEmAndamento.map((pedido) => (
                  <MeuPedidoCard key={pedido.id} pedido={pedido} />
                ))}
              </div>
            )}
          </section>

          <section>
            <h2>Pedidos entregues</h2>

            {pedidosEntregues.length === 0 ? (
              <p className="feedback">
                Você ainda não possui pedidos entregues.
              </p>
            ) : (
              <div className="meus-pedidos-lista">
                {pedidosEntregues.map((pedido) => (
                  <MeuPedidoCard key={pedido.id} pedido={pedido} />
                ))}
              </div>
            )}
          </section>

          {pedidosCancelados.length > 0 && (
            <section>
              <h2>Pedidos cancelados</h2>

              <div className="meus-pedidos-lista">
                {pedidosCancelados.map((pedido) => (
                  <MeuPedidoCard key={pedido.id} pedido={pedido} />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </section>
  );
}
