import {
  atualizarStatusPedido as atualizarStatusPedidoDaLoja,
  buscarPedidoPorId,
  buscarPedidos,
  PEDIDOS_ATUALIZADOS_EVENT,
} from "../../loja/api/pedidos.service";

import type { StatusPedidoType } from "../../loja/types/pedido";

export { PEDIDOS_ATUALIZADOS_EVENT };

export const pedidosService = {
  listarPedidos: buscarPedidos,

  async atualizarStatusPedido(
    pedidoId: string,
    novoStatus: StatusPedidoType,
  ): Promise<void> {
    const pedidoAtualizado = await atualizarStatusPedidoDaLoja(pedidoId, {
      status: novoStatus,
    });

    if (!pedidoAtualizado) {
      throw new Error(`Pedido ${pedidoId} não encontrado`);
    }
  },

  buscarPedido: buscarPedidoPorId,
};
