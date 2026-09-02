// src/types/pedido.ts
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
  mesa?: string;
  observacao?: string;
}