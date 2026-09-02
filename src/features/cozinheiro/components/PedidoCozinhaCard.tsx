import type { Pedido } from "../../loja/types/pedido";

interface PedidoCozinhaCardProps {
  pedido: Pedido;
  onConfirmar: (id: string) => void;
  onIniciarPreparo: (id: string) => void;
  onFinalizarPreparo: (id: string) => void;
}

export function PedidoCozinhaCard({
  pedido,
  onConfirmar,
  onIniciarPreparo,
  onFinalizarPreparo,
}: PedidoCozinhaCardProps) {
  const pedidoLocal = pedido.mesaId !== undefined;

  return (
    <article>
      <header>
        <h2>{pedidoLocal ? pedido.cliente.nome : `Pedido ${pedido.id}`}</h2>

        <p>
          Tipo: <span>{pedidoLocal ? "Pedido local" : "Pedido delivery"}</span>
        </p>

        <p>
          Status: <span>{pedido.status}</span>
        </p>
      </header>

      {!pedidoLocal && (
        <p>
          Cliente: <span>{pedido.cliente.nome}</span>
        </p>
      )}

      <h3>Itens</h3>

      <ul>
        {pedido.itens.map((item) => (
          <li key={item.id}>
            {item.quantity}x {item.pizzaName} — Tamanho {item.size}
            {item.observations && <p>Observação: {item.observations}</p>}
          </li>
        ))}
      </ul>

      {pedido.observacoes && <p>Observações do pedido: {pedido.observacoes}</p>}

      {pedido.status === "pendente" && (
        <button
          type="button"
          className="bg-primaria"
          onClick={() => onConfirmar(pedido.id)}
        >
          Confirmar pedido
        </button>
      )}

      {pedido.status === "confirmado" && (
        <button
          type="button"
          className="bg-primaria"
          onClick={() => onIniciarPreparo(pedido.id)}
        >
          Iniciar preparo
        </button>
      )}

      {pedido.status === "preparando" && (
        <button
          type="button"
          className="bg-primaria"
          onClick={() => onFinalizarPreparo(pedido.id)}
        >
          {pedidoLocal ? "Marcar como pronto" : "Preparado para delivery"}
        </button>
      )}
    </article>
  );
}
