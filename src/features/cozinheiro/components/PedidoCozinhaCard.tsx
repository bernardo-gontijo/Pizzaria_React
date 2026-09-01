import type { Pedido } from "../../loja/types/pedido";

interface PedidoCozinhaCardProps {
  pedido: Pedido;
  onConfirmar: (id: string) => void;
  onIniciarPreparo: (id: string) => void;
}

export function PedidoCozinhaCard({
  pedido,
  onConfirmar,
  onIniciarPreparo,
}: PedidoCozinhaCardProps) {
  return (
    <article>
      <header>
        <h2>Pedido {pedido.id}</h2>

        <p>
          Status: <strong>{pedido.status}</strong>
        </p>
      </header>

      <p>
        Cliente: <strong>{pedido.cliente.nome}</strong>
      </p>

      <h3>Itens</h3>

      <ul>
        {pedido.itens.map((item) => (
          <li key={item.id}>
            {item.quantity}x {item.pizzaName} - Tamanho {item.size}
            {item.observations && <p>Observação: {item.observations}</p>}
          </li>
        ))}
      </ul>

      {pedido.observacoes && (
        <p>
          <strong>Observações do pedido:</strong> {pedido.observacoes}
        </p>
      )}

      {pedido.status === "pendente" && (
        <button type="button" onClick={() => onConfirmar(pedido.id)}>
          Confirmar pedido
        </button>
      )}

      {pedido.status === "confirmado" && (
        <button type="button" onClick={() => onIniciarPreparo(pedido.id)}>
          Iniciar preparo
        </button>
      )}
    </article>
  );
}
