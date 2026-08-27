import { useEffect } from 'react';

import { PedidoTable } from '../components/PedidoTable';
import { useAdminPedidos } from '../hooks/useAdminPedidos';

export function PedidoAdminPage() {
  const {
    pedidos,
    carregando,
    erro,
    carregarPedidos,
    atualizarStatus,
  } = useAdminPedidos();

  useEffect(() => {
    carregarPedidos();
  }, [carregarPedidos]);

  return (
    <main>
      <h1>Gerenciamento de Pedidos</h1>

      <p>
        Consulte os pedidos recebidos e
        atualize o status de cada entrega.
      </p>

      {carregando && (
        <p>Carregando pedidos...</p>
      )}

      {erro && (
        <p role="alert">{erro}</p>
      )}

      {!carregando && !erro && (
        <PedidoTable
          pedidos={pedidos}
          onAtualizarStatus={
            atualizarStatus
          }
        />
      )}
    </main>
  );
}