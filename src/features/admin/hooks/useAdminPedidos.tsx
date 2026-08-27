import {
  useCallback,
  useState,
} from 'react';

import type {
  Order,
  OrderStatus,
} from '../../../store/order.store';

const PEDIDOS_KEY = 'pizzashop-pedidos';

export function useAdminPedidos() {
  const [pedidos, setPedidos] =
    useState<Order[]>([]);

  const [carregando, setCarregando] =
    useState(false);

  const [erro, setErro] =
    useState<string | null>(null);

  const carregarPedidos = useCallback(() => {
    try {
      setCarregando(true);
      setErro(null);

      const pedidosSalvos =
        localStorage.getItem(PEDIDOS_KEY);

      if (!pedidosSalvos) {
        setPedidos([]);
        return;
      }

      const dados = JSON.parse(
        pedidosSalvos,
      ) as Order[];

      setPedidos(dados);
    } catch {
      setErro(
        'Não foi possível carregar os pedidos',
      );
    } finally {
      setCarregando(false);
    }
  }, []);

  function atualizarStatus(
    id: string,
    novoStatus: OrderStatus,
  ) {
    setPedidos((pedidosAtuais) => {
      const pedidosAtualizados =
        pedidosAtuais.map((pedido) =>
          pedido.id === id
            ? {
                ...pedido,
                status: novoStatus,
              }
            : pedido,
        );

      localStorage.setItem(
        PEDIDOS_KEY,
        JSON.stringify(pedidosAtualizados),
      );

      return pedidosAtualizados;
    });
  }

  return {
    pedidos,
    carregando,
    erro,
    carregarPedidos,
    atualizarStatus,
  };
}