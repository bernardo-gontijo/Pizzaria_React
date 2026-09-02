import { Link } from "react-router-dom";

import type { Pedido, StatusPedidoType } from "../types/pedido";

interface MeuPedidoCardProps {
  pedido: Pedido;
}

const nomesStatus: Record<StatusPedidoType, string> = {
  pendente: "Aguardando confirmação",
  confirmado: "Confirmado",
  preparando: "Em preparo",
  pronto: "Pronto",
  entregue: "Entregue",
  cancelado: "Cancelado",
};

export function MeuPedidoCard({ pedido }: MeuPedidoCardProps) {
  const quantidadeItens = pedido.itens.reduce(
    (total, item) => total + item.quantity,
    0,
  );

  return (
    <article className="meu-pedido-card">
      <div className="meu-pedido-card__cabecalho">
        <div>
          <span>Pedido #{pedido.id.slice(-6)}</span>
          <time dateTime={new Date(pedido.createdAt).toISOString()}>
            {new Date(pedido.createdAt).toLocaleString("pt-BR")}
          </time>
        </div>
        <strong className={`meu-pedido-card__status status--${pedido.status}`}>
          {nomesStatus[pedido.status]}
        </strong>
      </div>

      <div className="meu-pedido-card__resumo">
        <span>
          {quantidadeItens} {quantidadeItens === 1 ? "item" : "itens"}
        </span>
        <strong>
          {pedido.total.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          })}
        </strong>
      </div>

      <Link className="meu-pedido-card__link" to={`/acompanhar/${pedido.id}`}>
        Acompanhar pedido
      </Link>
    </article>
  );
}
