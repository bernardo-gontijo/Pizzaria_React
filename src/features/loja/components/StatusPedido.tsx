interface StatusPedidoProps {
  pedido: {
    id: string;
    status: string;
    cliente: { nome: string };
    endereco?: { rua: string };
    total: number;
  };
}

const STATUS_MAP: Record<string, string> = {
  pendente: " Aguardando",
  confirmado: " Confirmado",
  preparando: " Preparando",
  pronto: " Pronto",
  entregue: " Entregue",
  cancelado: " Cancelado",
};

export function StatusPedido({ pedido }: StatusPedidoProps) {
  const steps = ["pendente", "confirmado", "preparando", "pronto", "entregue"];
  const currentIndex = steps.indexOf(pedido.status);

  return (
    <div className="status-pedido">
      <div className="status-pedido__cabecalho">
        <span>Pedido #{pedido.id.slice(-6)}</span>
        <h2>{STATUS_MAP[pedido.status] || pedido.status}</h2>
      </div>

      <ol className="status-timeline">
        {steps.map((step, index) => (
          <li key={step} className={index <= currentIndex ? "completed" : ""}>
            <span>{index + 1}</span>
            <span>{STATUS_MAP[step]}</span>
          </li>
        ))}
      </ol>

      <div className="status-detalhes">
        <p>
          <strong>Cliente:</strong> {pedido.cliente.nome}
        </p>
        {pedido.endereco && (
          <p>
            <strong>Endereço:</strong> {pedido.endereco.rua}
          </p>
        )}
        <p>
          <strong>Total:</strong> R$ {pedido.total.toFixed(2)}
        </p>
      </div>
    </div>
  );
}
