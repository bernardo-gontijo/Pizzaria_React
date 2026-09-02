import type { Pedido } from "../../loja/types/pedido";

export type { Pedido, StatusPedidoType } from "../../loja/types/pedido";

export interface EntregadorPedidosState {
  pedidosProntos: Pedido[];
  pedidosEmRota: Pedido[];
  pedidosEntregues: Pedido[];
  loading: boolean;
  error: string | null;
}

export interface EntregadorStats {
  totalPedidos: number;
  pedidosProntos: number;
  pedidosEmRota: number;
  entregasHoje: number;
}

export interface EntregadorAction {
  (pedidoId: string): Promise<void>;
}
