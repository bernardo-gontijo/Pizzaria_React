
export interface Pedido {
  id: string;
  cliente: {
    nome: string;
    id?: string;
    telefone?: string;
  };
  endereco: string;
  itens: Array<{
    id?: string;
    nome: string;
    quantidade: number;
    preco?: number;
  }>;
  total: number;
  status: 'pendente' | 'preparando' | 'pronto' | 'saiu_para_entrega' | 'entregue' | 'cancelado';
  createdAt: string;
  updatedAt?: string;
}

// Tipo para status
export type StatusPedidoType = 
  | 'pendente'
  | 'preparando'
  | 'pronto'
  | 'saiu_para_entrega'
  | 'entregue'
  | 'cancelado';


export interface EntregadorPedidosState {
  pedidosProntos: Pedido[];
  pedidosEmRota: Pedido[];
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