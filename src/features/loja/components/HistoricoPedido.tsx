import { History } from "lucide-react";

import type { StatusHistorico } from "../types/pedido";

interface HistoricoPedidoProps {
  statusHistorico: StatusHistorico[];
}

const NOMES_STATUS: Record<string, string> = {
  pendente: "Aguardando confirmação",
  confirmado: "Confirmado",
  preparando: "Em preparo",
  pronto: "Pronto",
  saiu_para_entrega: "Saiu para entrega",
  entregue: "Entregue",
  cancelado: "Cancelado",
};

function formatarDataHora(data: Date): string {
  return new Date(data).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function HistoricoPedido({ statusHistorico }: HistoricoPedidoProps) {
  if (statusHistorico.length === 0) {
    return null;
  }

  const historicoOrdenado = [...statusHistorico].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  );

  return (
    <div className="historico-pedido">
      <h2 className="historico-pedido__titulo">
        <History size={18} aria-hidden="true" />
        Histórico do pedido
      </h2>

      <ol className="historico-pedido__lista">
        {historicoOrdenado.map((registro) => (
          <li key={registro.id} className="historico-pedido__item">
            <span className="historico-pedido__marcador" aria-hidden="true" />

            <div className="historico-pedido__conteudo">
              <div className="historico-pedido__cabecalho">
                <strong>{NOMES_STATUS[registro.status] ?? registro.status}</strong>
                <time dateTime={new Date(registro.timestamp).toISOString()}>
                  {formatarDataHora(registro.timestamp)}
                </time>
              </div>

              {registro.message && <p>{registro.message}</p>}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}