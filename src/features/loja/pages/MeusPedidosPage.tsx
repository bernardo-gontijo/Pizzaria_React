import { useEffect } from "react";
import { Link } from "react-router-dom";

import { MeuPedidoCard } from "../components/MeuPedidoCard";
import { useMeusPedidos } from "../hooks/useMeusPedidos";

export function MeusPedidosPage() {
  const { pedidos, loading, erro, carregarPedidos } = useMeusPedidos();

  useEffect(() => {
    void carregarPedidos();
  }, [carregarPedidos]);

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
        <div className="meus-pedidos-lista">
          {pedidos.map((pedido) => (
            <MeuPedidoCard key={pedido.id} pedido={pedido} />
          ))}
        </div>
      )}
    </section>
  );
}