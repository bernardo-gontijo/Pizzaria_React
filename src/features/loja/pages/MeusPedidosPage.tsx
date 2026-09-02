import { Link } from "react-router-dom";

import { MeuPedidoCard } from "../components/MeuPedidoCard";
import { useMeusPedidos } from "../hooks/useMeusPedidos";

export function MeusPedidosPage() {
  const { pedidos, loading, erro } = useMeusPedidos();

  return (
    <section className="pagina-loja meus-pedidos-page">
      <h1>Meus pedidos</h1>
      <p className="pagina-loja__introducao">
        Consulte os pedidos online feitos neste dispositivo e acompanhe o
        preparo de cada um.
      </p>

      {loading && <p className="feedback">Carregando seus pedidos...</p>}
      {erro && <p className="feedback feedback--erro">{erro}</p>}

      {!loading && !erro && pedidos.length === 0 && (
        <div className="meus-pedidos-vazio">
          <p>Você ainda não fez nenhum pedido online neste dispositivo.</p>
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
