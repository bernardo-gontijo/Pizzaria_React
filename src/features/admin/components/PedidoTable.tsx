import type { Pedido, StatusPedidoType } from "../../loja/types/pedido";
import { NOMES_STATUS_PEDIDO } from "../utils/admin.utils";

interface PedidoTableProps {
  pedidos: Pedido[];
  onAtualizarStatus: (id: string, status: StatusPedidoType) => void;
}

export function PedidoTable({ pedidos, onAtualizarStatus }: PedidoTableProps) {
  if (pedidos.length === 0) {
    return <p>Nenhum pedido encontrado.</p>;
  }

  return (
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
            <td>{pedido.id}</td>
            <td>
              <strong>{pedido.cliente.nome}</strong>
              <br />
              {pedido.cliente.telefone}
            </td>
            <td>{pedido.itens.length}</td>
            <td>{pedido.formaPagamento}</td>
            <td>
              {pedido.total.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </td>
            <td>
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
                {Object.entries(NOMES_STATUS_PEDIDO).map(([status, nome]) => (
                  <option key={status} value={status}>
                    {nome}
                  </option>
                ))}
              </select>
              <small>{NOMES_STATUS_PEDIDO[pedido.status]}</small>
            </td>
            <td>{new Date(pedido.createdAt).toLocaleString("pt-BR")}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
