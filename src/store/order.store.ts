import type { PaymentMethod } from '../features/loja/types/tenant';
import type { CartItem } from './cart.store';

export type OrderStatus =
  | 'recebido'
  | 'preparo'
  | 'saiu_para_entrega'
  | 'entregue';

export interface DadosCliente {
  nome: string;
  telefone: string;
  endereco: string;
  numero: string;
  bairro: string;
  complemento?: string;
}

export interface Order {
  id: string;
  itens: CartItem[];
  cliente: DadosCliente;
  formaPagamento: PaymentMethod;
  subtotal: number;
  taxaEntrega: number;
  total: number;
  status: OrderStatus;
  criadoEm: string;
}