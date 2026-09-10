import type { EnderecoEntrega } from "../types/pedido";
import { formatarEndereco } from "../utils/endereco";

interface StatusHistoricoItem {
  id: string;
  status: string;
  timestamp: Date;
  message: string;
}

interface StatusPedidoProps {
  pedido: {
    id: string;
    status: string;
    cliente: { nome: string };
    endereco?: Partial<EnderecoEntrega>;
    total: number;
    statusHistorico?: StatusHistoricoItem[];
  };
}

const STATUS_MAP: Record<string, string> = {
  pendente: "Aguardando",
  confirmado: "Confirmado",
  preparando: "Preparando",
  pronto: "Pronto",
  saiu_para_entrega: "Saiu para entrega",
  entregue: "Entregue",
  cancelado: "Cancelado",
};

function formatarDataHora(data: Date): string {
  return data.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function StatusPedido({ pedido }: StatusPedidoProps) {
  const steps = [
    "pendente",
    "confirmado",
    "preparando",
    "pronto",
    "saiu_para_entrega",
    "entregue",
  ];

  const currentIndex = steps.indexOf(pedido.status);

  return (
    <div className="status-pedido">
      <div className="status-pedido__cabecalho">
        <span>Pedido #{pedido.id.slice(-6)}</span>
        <h2>{STATUS_MAP[pedido.status] || pedido.status}</h2>
      </div>

      <ol className="status-timeline">
        {steps.map((step, index) => (
          <li
            key={step}
            className={index <= currentIndex ? "completed" : ""}
          >
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
            <strong>Endereço:</strong>{" "}
            {formatarEndereco(pedido.endereco)}
          </p>
        )}

        <p>
          <strong>Total:</strong> R$ {pedido.total.toFixed(2)}
        </p>
      </div>

      {pedido.statusHistorico &&
        pedido.statusHistorico.length > 0 && (
          <div className="status-historico">
            <h3>Histórico do pedido</h3>

            <ol className="status-historico__lista">
              {pedido.statusHistorico.map((historico) => (
                <li
                  key={historico.id}
                  className="status-historico__item"
                >
                  <strong>
                    {STATUS_MAP[historico.status] ||
                      historico.status}
                  </strong>

                  <span>
                    {formatarDataHora(historico.timestamp)}
                  </span>

                  <p>{historico.message}</p>
                </li>
              ))}
            </ol>
          </div>
        )}
    </div>
  );
}