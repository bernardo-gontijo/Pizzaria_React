import type { Pedido } from "../../loja/types/pedido";
import { formatarEndereco } from "../../loja/utils/endereco";

interface PedidoEntregadorCardProps {
  pedido: Pedido;
  onAction: (id: string) => Promise<void>;
  atualizando: boolean;
  tipo: "pronto" | "emRota";
}

export function PedidoEntregadorCard({
  pedido,
  onAction,
  atualizando,
  tipo,
}: PedidoEntregadorCardProps) {
  const quantidadeItens = pedido.itens.reduce(
    (total, item) => total + item.quantity,
    0,
  );

  return (
    <article className="pedido-entregador-card">
      <header className="pedido-entregador-card__cabecalho">
        <div>
          <span>Pedido #{pedido.id.slice(-6)}</span>
          <strong>{tipo === "pronto" ? "Pronto" : "Em rota"}</strong>
        </div>
        <strong>
          {pedido.total.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          })}
        </strong>
      </header>

      <dl className="pedido-entregador-card__detalhes">
        <div>
          <dt>Cliente</dt>
          <dd>{pedido.cliente.nome}</dd>
        </div>
        <div>
          <dt>Telefone</dt>
          <dd>{pedido.cliente.telefone || "Não informado"}</dd>
        </div>
        <div>
          <dt>Endereço</dt>
          <dd>{formatarEndereco(pedido.endereco)}</dd>
        </div>
        <div>
          <dt>Itens</dt>
          <dd>{quantidadeItens}</dd>
        </div>
      </dl>

      <button
        type="button"
        disabled={atualizando}
        onClick={() => void onAction(pedido.id)}
      >
        {atualizando
          ? "Processando..."
          : tipo === "pronto"
            ? "Saiu para entrega"
            : "Marcar como entregue"}
      </button>
    </article>
  );
}
