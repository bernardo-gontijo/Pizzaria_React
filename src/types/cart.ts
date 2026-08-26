import type { Pizza, PizzaSize } from './pizza';

export interface CartItem {
  id: string;
  nome : string;
  pizza: Pizza;
  tamanho: PizzaSize;
  borda?: string;
  ingredientesExtras: string[];
  observacoes?: string;
  quantidade: number;
  precoUnitario: number;
}

export interface CartState {
  items: CartItem[];
}

export interface CartContextData {
  items: CartItem[];
  adicionarItem: (item: CartItem) => void;
  removerItem: (id: string) => void;
  alterarQuantidade: (id: string, quantidade: number) => void;
  limparCarrinho: () => void;
  subtotal: number;
  taxaEntrega: number;
  total: number;
}