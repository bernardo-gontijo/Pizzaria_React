export type PizzaCategory =
  | 'tradicional'
  | 'especial'
  | 'vegetariana'
  | 'doce';

export type PizzaSize = 'broto' | 'media' | 'grande' | 'familia';

export interface Pizza {
  id: string;
  nome: string;
  descricao: string;
  preco: number;
  ingredientes: string[];
  imagem: string;
  categoria: PizzaCategory;
  disponivel: boolean;
}

export interface PizzaFilter {
  categoria?: PizzaCategory;
  ingrediente?: string;
  tamanho?: PizzaSize;
  busca?: string;
}