import { ChevronDown } from "lucide-react";

import type { Pedido, StatusPedidoType } from "../../loja/types/pedido";
import {
  NOMES_STATUS_PEDIDO,
  formatarData,
  formatarFormaPagamento,
  formatarMoeda,
} from "../utils/admin.utils";

interface PedidoTableProps {
  pedidos: Pedido[];
  onAtualizarStatus: (id: string, status: StatusPedidoType) => void;
}

const CLASSE_STATUS: Record<StatusPedidoType, string> = {
  pendente: "status-badge--pendente",
  confirmado: "status-badge--confirmado",
  preparando: "status-badge--preparando",
  pronto: "status-badge--pronto",
  saiu_para_entrega: "status-badge--saiu-para-entrega",
  entregue: "status-badge--entregue",
  cancelado: "status-badge--cancelado",
};

function numeroPedido(id: string): string {
  const somenteDigitos = id.replace(/\D/g, "");

  if (somenteDigitos.length === 0) {
    return id.slice(0, 4);
  }

  return `#${somenteDigitos.slice(-2).padStart(2, "0")}`;
}

function quantidadeTotalItens(pedido: Pedido): number {
  return pedido.itens.reduce((total, item) => total + item.quantity, 0);
}

export function PedidoTable({ pedidos, onAtualizarStatus }: PedidoTableProps) {
  if (pedidos.length === 0) {
    return <p className="pedido-admin-tabela__vazio">Nenhum pedido encontrado.</p>;
  }

  return (
    <div className="pedido-admin-tabela">
      <table>
        <thead>
          <tr>
            <th>Pedido</th>
            <th>Cliente</th>
            <th>Itens</th>
            <th>Pagamento</th>
            <th>Total</th>
            <th>Status</th>
            <th>Data</th>
          </tr>
        </thead>

        <tbody>
          {pedidos.map((pedido) => (
            <tr key={pedido.id}>
              <td>
                <strong>{numeroPedido(pedido.id)}</strong>
              </td>

              <td>
                <div className="pedido-admin-tabela__cliente">
                  <strong>{pedido.cliente.nome}</strong>
                  <span>
                    {pedido.mesaId
                      ? `Mesa ${pedido.mesaId}`
                      : pedido.cliente.telefone || "Delivery"}
                  </span>
                </div>
              </td>

              <td>
                <span className="pedido-admin-tabela__qtd">
                  {quantidadeTotalItens(pedido)} un.
                </span>
              </td>

              <td>{formatarFormaPagamento(pedido.formaPagamento)}</td>

              <td>
                <strong>{formatarMoeda(pedido.total)}</strong>
              </td>

              <td>
                <div
                  className={`status-badge ${CLASSE_STATUS[pedido.status]}`}
                >
                  <select
                    value={pedido.status}
                    onChange={(event) =>
                      onAtualizarStatus(
                        pedido.id,
                        event.target.value as StatusPedidoType,
                      )
                    }
                    aria-label={`Status do pedido ${pedido.id}`}
                  >
                    {Object.entries(NOMES_STATUS_PEDIDO).map(
                      ([status, nome]) => (
                        <option key={status} value={status}>
                          {nome}
                        </option>
                      ),
                    )}
                  </select>

                  <span>{NOMES_STATUS_PEDIDO[pedido.status]}</span>

                  <ChevronDown size={13} aria-hidden="true" />
                </div>
              </td>

              <td className="pedido-admin-tabela__data">
                {formatarData(pedido.createdAt.toISOString())}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}