import type {
  Order,
  OrderStatus,
} from '../../../store/order.store';

interface PedidoTableProps {
  pedidos: Order[];
  onAtualizarStatus: (
    id: string,
    status: OrderStatus,
  ) => void;
}

const nomesStatus: Record<OrderStatus, string> = {
  recebido: 'Recebido',
  preparo: 'Em preparo',
  saiu_para_entrega: 'Saiu para entrega',
  entregue: 'Entregue',
};

export function PedidoTable({
  pedidos,
  onAtualizarStatus,
}: PedidoTableProps) {
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
              {pedido.total.toLocaleString(
                'pt-BR',
                {
                  style: 'currency',
                  currency: 'BRL',
                },
              )}
            </td>

            <td>
              <select
                value={pedido.status}
                onChange={(event) =>
                  onAtualizarStatus(
                    pedido.id,
                    event.target
                      .value as OrderStatus,
                  )
                }
                aria-label={`Status do pedido ${pedido.id}`}
              >
                <option value="recebido">
                  Recebido
                </option>

                <option value="preparo">
                  Em preparo
                </option>

                <option value="saiu_para_entrega">
                  Saiu para entrega
                </option>

                <option value="entregue">
                  Entregue
                </option>
              </select>

              <small>
                {nomesStatus[pedido.status]}
              </small>
            </td>

            <td>
              {new Date(
                pedido.criadoEm,
              ).toLocaleString('pt-BR')}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}