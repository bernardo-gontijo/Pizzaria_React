import { type Pizza } from './pizza';

export interface ItemPedido {
  id: string;
  pizzaId: string;
  pizzaName: string;
  quantity: number;
  price: number;
  size: 'P' | 'M' | 'G' | 'GG';
  observations?: string;
  pizza?: Pizza;
}

export type StatusPedidoType = 
  | 'pendente'
  | 'confirmado'
  | 'preparando'
  | 'pronto'
  | 'entregue'
  | 'cancelado';

export interface StatusHistorico {
  id: string;
  status: StatusPedidoType;
  timestamp: Date;
  message: string;
}

export interface EnderecoEntrega {
  cep: string;
  rua: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  estado: string;
  referencia?: string;
}

export interface Pedido {
  id: string;
  cliente: {
    nome: string;
    email?: string;
    telefone: string;
  };
  endereco: EnderecoEntrega;
  itens: ItemPedido[];
  subtotal: number;
  taxaEntrega: number;
  desconto: number;
  total: number;
  formaPagamento: 'dinheiro' | 'cartao_credito' | 'cartao_debito' | 'pix' | 'vale_refeicao';
  trocoPara?: number;
  status: StatusPedidoType;
  statusHistorico: StatusHistorico[];
  observacoes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CriarPedidoDTO {
  cliente: {
    nome: string;
    email?: string;
    telefone: string;
  };
  endereco: EnderecoEntrega;
  itens: Omit<ItemPedido, 'id'>[];
  formaPagamento: 'dinheiro' | 'cartao_credito' | 'cartao_debito' | 'pix' | 'vale_refeicao';
  trocoPara?: number;
  observacoes?: string;
}

export interface AtualizarStatusPedidoDTO {
  status: StatusPedidoType;
  message?: string;
}