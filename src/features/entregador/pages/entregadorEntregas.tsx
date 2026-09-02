import { useState } from 'react';

interface Entrega {
  id: number;
  pedidoId: number;
  cliente: string;
  endereco: string;
  status: 'pendente' | 'em_rota' | 'entregue';
  data: string;
}

export function EntregadorEntregas() {
  const [entregas, setEntregas] = useState<Entrega[]>([
    {
      id: 1,
      pedidoId: 1,
      cliente: 'João Silva',
      endereco: 'Rua das Flores, 123',
      status: 'pendente',
      data: 'Hoje, 14:30'
    },
    {
      id: 2,
      pedidoId: 2,
      cliente: 'Maria Santos',
      endereco: 'Av. Principal, 456',
      status: 'em_rota',
      data: 'Hoje, 15:00'
    },
    {
      id: 3,
      pedidoId: 3,
      cliente: 'Carlos Oliveira',
      endereco: 'Rua do Comércio, 789',
      status: 'pendente',
      data: 'Hoje, 15:30'
    }
  ]);

  const atualizarStatusEntrega = (id: number, novoStatus: 'pendente' | 'em_rota' | 'entregue') => {
    setEntregas(entregas.map(entrega => 
      entrega.id === id ? { ...entrega, status: novoStatus } : entrega
    ));
  };

  const getStatusCor = (status: string) => {
    switch(status) {
      case 'pendente': return '#e63946';
      case 'em_rota': return '#f4a261';
      case 'entregue': return '#2a9d8f';
      default: return '#666';
    }
  };

  const getStatusLabel = (status: string) => {
    switch(status) {
      case 'pendente': return ' Pendente';
      case 'em_rota': return ' Em rota';
      case 'entregue': return ' Entregue';
      default: return status;
    }
  };

  // Estatísticas
  const totalEntregas = entregas.length;
  const pendentes = entregas.filter(e => e.status === 'pendente').length;
  const emRota = entregas.filter(e => e.status === 'em_rota').length;
  const entregues = entregas.filter(e => e.status === 'entregue').length;

  return (
    <main>
      <h1> Entregas</h1>
      <p>Acompanhe suas entregas em tempo real</p>

      {/* Cards de estatísticas */}
      <section>
        <article>
          <h3>Total</h3>
          <strong>{totalEntregas}</strong>
        </article>
        <article>
          <h3>Pendentes</h3>
          <strong style={{ color: '#e63946' }}>{pendentes}</strong>
        </article>
        <article>
          <h3>Em Rota</h3>
          <strong style={{ color: '#f4a261' }}>{emRota}</strong>
        </article>
        <article>
          <h3>Entregues</h3>
          <strong style={{ color: '#2a9d8f' }}>{entregues}</strong>
        </article>
      </section>

      {/* Tabela de entregas */}
      <div style={{ marginTop: '32px', overflowX: 'auto' }}>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Pedido</th>
              <th>Cliente</th>
              <th>Endereço</th>
              <th>Status</th>
              <th>Data</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {entregas.map((entrega) => (
              <tr key={entrega.id}>
                <td>#{entrega.id}</td>
                <td>#{entrega.pedidoId}</td>
                <td>{entrega.cliente}</td>
                <td>{entrega.endereco}</td>
                <td>
                  <span style={{ 
                    color: getStatusCor(entrega.status),
                    fontWeight: 'bold'
                  }}>
                    {getStatusLabel(entrega.status)}
                  </span>
                </td>
                <td>{entrega.data}</td>
                <td>
                  {entrega.status === 'pendente' && (
                    <button onClick={() => atualizarStatusEntrega(entrega.id, 'em_rota')}>
                      Iniciar Rota
                    </button>
                  )}
                  {entrega.status === 'em_rota' && (
                    <button onClick={() => atualizarStatusEntrega(entrega.id, 'entregue')}>
                      Concluir
                    </button>
                  )}
                  {entrega.status === 'entregue' && (
                    <span style={{ color: '#2a9d8f' }}> Finalizado</span>
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