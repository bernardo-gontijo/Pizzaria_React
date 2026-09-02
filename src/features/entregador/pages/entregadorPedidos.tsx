import { useState } from 'react';

// Tipo do pedido
interface Pedido {
  id: number;
  cliente: string;
  endereco: string;
  itens: string;
  total: string;
  status: 'pendente' | 'em_andamento' | 'entregue';
}

export function EntregadorPedidos() {
  const [pedidos, setPedidos] = useState<Pedido[]>([
    {
      id: 1,
      cliente: 'João Silva',
      endereco: 'Rua das Flores, 123',
      itens: '2x Pizza Margherita, 1x Coca-Cola',
      total: 'R$ 85,00',
      status: 'pendente'
    },
    {
      id: 2,
      cliente: 'Maria Santos',
      endereco: 'Av. Principal, 456',
      itens: '1x Pizza Calabresa, 2x Suco',
      total: 'R$ 65,00',
      status: 'em_andamento'
    },
    {
      id: 3,
      cliente: 'Carlos Oliveira',
      endereco: 'Rua do Comércio, 789',
      itens: '3x Pizza Portuguesa',
      total: 'R$ 120,00',
      status: 'pendente'
    }
  ]);

  const atualizarStatus = (id: number, novoStatus: 'pendente' | 'em_andamento' | 'entregue') => {
    setPedidos(pedidos.map(pedido => 
      pedido.id === id ? { ...pedido, status: novoStatus } : pedido
    ));
  };

  const getStatusCor = (status: string) => {
    switch(status) {
      case 'pendente': return '#e63946';
      case 'em_andamento': return '#f4a261';
      case 'entregue': return '#2a9d8f';
      default: return '#666';
    }
  };

  const getStatusLabel = (status: string) => {
    switch(status) {
      case 'pendente': return ' Pendente';
      case 'em_andamento': return ' Em andamento';
      case 'entregue': return ' Entregue';
      default: return status;
    }
  };

  return (
    <main>
      <h1> Pedidos</h1>
      <p>Gerencie os pedidos para entrega</p>

      <div style={{ marginTop: '24px', overflowX: 'auto' }}>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Cliente</th>
              <th>Endereço</th>
              <th>Itens</th>
              <th>Total</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {pedidos.map((pedido) => (
              <tr key={pedido.id}>
                <td>#{pedido.id}</td>
                <td>{pedido.cliente}</td>
                <td>{pedido.endereco}</td>
                <td>{pedido.itens}</td>
                <td>{pedido.total}</td>
                <td>
                  <span style={{ 
                    color: getStatusCor(pedido.status),
                    fontWeight: 'bold'
                  }}>
                    {getStatusLabel(pedido.status)}
                  </span>
                </td>
                <td>
                  {pedido.status === 'pendente' && (
                    <button onClick={() => atualizarStatus(pedido.id, 'em_andamento')}>
                      Iniciar
                    </button>
                  )}
                  {pedido.status === 'em_andamento' && (
                    <button onClick={() => atualizarStatus(pedido.id, 'entregue')}>
                      Entregar
                    </button>
                  )}
                  {pedido.status === 'entregue' && (
                    <span style={{ color: '#2a9d8f' }}>✅ Concluído</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}