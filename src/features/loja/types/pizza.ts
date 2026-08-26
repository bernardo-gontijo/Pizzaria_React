export type PizzaCategory =
  | 'tradicional'
  | 'especial'
  | 'vegetariana'
  | 'doce';

export type PizzaSize = 'broto' | 'media' | 'grande' | 'familia';

export interface Pizza {
  readonly id: string;
  readonly nome: string;
  readonly descricao: string;
  readonly preco: number;
  readonly ingredientes: string[];
  readonly imagem: string;
  readonly categoria: PizzaCategory;
  readonly disponivel: boolean;
}

export interface PizzaFilter {
  categoria?: PizzaCategory;
  ingrediente?: string;
  tamanho?: PizzaSize;
  busca?: string;
}