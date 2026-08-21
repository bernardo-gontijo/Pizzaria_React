import type { PaymentMethod } from './tenant';
import type { CartItem } from './cart';

export type OrderStatus =
  | 'recebido'
  | 'preparo'
  | 'saiu_para_entrega'
  | 'entregue';

export interface CustomerData {
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
  cliente: CustomerData;
  formaPagamento: PaymentMethod;
  subtotal: number;
  taxaEntrega: number;
  total: number;
  status: OrderStatus;
  criadoEm: string;
}