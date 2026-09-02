import type { Pedido } from "../../loja/types/pedido";

interface PedidoCozinhaCardProps {
  pedido: Pedido;
  atualizando: boolean;
  onConfirmar: (id: string) => void;
  onIniciarPreparo: (id: string) => void;
  onFinalizarPreparo: (id: string) => void;
}

const nomesStatus = {
  pendente: "Pendente",
  confirmado: "Confirmado",
  preparando: "Em preparo",
  pronto: "Pronto",
  entregue: "Entregue",
  cancelado: "Cancelado",
};

function calcularTempoEspera(dataPedido: Date) {
  const agora = Date.now();
  const criadoEm = new Date(dataPedido).getTime();

  const minutos = Math.max(0, Math.floor((agora - criadoEm) / (1000 * 60)));

  if (minutos < 1) {
    return "Agora";
  }

  if (minutos < 60) {
    return `${minutos} min`;
  }

  const horas = Math.floor(minutos / 60);
  const minutosRestantes = minutos % 60;

  return `${horas}h ${minutosRestantes}min`;
}

export function PedidoCozinhaCard({
  pedido,
  atualizando,
  onConfirmar,
  onIniciarPreparo,
  onFinalizarPreparo,
}: PedidoCozinhaCardProps) {
  const pedidoLocal = pedido.mesaId !== undefined;

  const horarioPedido = new Date(pedido.createdAt).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const tempoEspera = calcularTempoEspera(pedido.createdAt);

  const quantidadeItens = pedido.itens.reduce(
    (total, item) => total + item.quantity,
    0,
  );

  return (
    <article>
      <header>
        <h2>{pedidoLocal ? pedido.cliente.nome : `Pedido ${pedido.id}`}</h2>

        <p>
          Tipo: <span>{pedidoLocal ? "Pedido local" : "Pedido delivery"}</span>
        </p>

        <p>
          Recebido às: <span>{horarioPedido}</span>
        </p>

        <p>
          Tempo de espera: <span>{tempoEspera}</span>
        </p>

        <p>
          Status: <span>{nomesStatus[pedido.status]}</span>
        </p>
      </header>

      {!pedidoLocal && (
        <p>
          Cliente: <span>{pedido.cliente.nome}</span>
        </p>
      )}

      <h3>Itens ({quantidadeItens})</h3>

      <ul>
        {pedido.itens.map((item) => (
          <li key={item.id}>
            {item.quantity}x {item.pizzaName}
            {item.tipo === "bebida" ? (
              <> — Bebida</>
            ) : (
              item.size && <> — Tamanho {item.size}</>
            )}
            {item.observations && <p>⚠️ Observação: {item.observations}</p>}
          </li>
        ))}
      </ul>

      {pedido.observacoes && (
        <p>⚠️ Observação do pedido: {pedido.observacoes}</p>
      )}

      {pedido.status === "pendente" && (
        <button
          type="button"
          className="bg-primaria"
          disabled={atualizando}
          onClick={() => onConfirmar(pedido.id)}
        >
          {atualizando ? "Processando..." : "Confirmar pedido"}
        </button>
      )}

      {pedido.status === "confirmado" && (
        <button
          type="button"
          className="bg-primaria"
          disabled={atualizando}
          onClick={() => onIniciarPreparo(pedido.id)}
        >
          {atualizando ? "Processando..." : "Iniciar preparo"}
        </button>
      )}

      {pedido.status === "preparando" && (
        <button
          type="button"
          className="bg-primaria"
          disabled={atualizando}
          onClick={() => onFinalizarPreparo(pedido.id)}
        >
          {atualizando
            ? "Processando..."
            : pedidoLocal
              ? "Marcar como pronto"
              : "Preparado para delivery"}
        </button>
      )}
    </article>
  );
}
