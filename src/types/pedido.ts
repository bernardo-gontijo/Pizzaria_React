export interface ComboItemRef {
  tipo: "pizza" | "bebida";
  id: string;
  quantidade: number;
}

export interface Combo {
  readonly id: string;
  readonly nome: string;
  readonly descricao?: string;
  readonly itens: ComboItemRef[];
  // Percentual de desconto aplicado sobre a soma dos preços reais dos
  // itens (0 a 100). É o único valor que o admin edita depois de
  // criado o combo — os preços em si sempre vêm do cardápio.
  readonly descontoPercentual: number;
  readonly disponivel: boolean;
}

// Combo "resolvido": mesma informação de Combo, mas já com os nomes e
// preços atuais de cada item (buscados do cardápio) e os totais
// calculados. É o formato usado para exibir o combo na loja, sempre
// refletindo os preços de pizza/bebida em vigor.
export interface ComboResolvidoItem {
  tipo: "pizza" | "bebida";
  id: string;
  nome: string;
  precoUnitario: number;
  quantidade: number;
  imagem: string;
  disponivel: boolean;
}

export interface ComboResolvido extends Omit<Combo, "itens"> {
  itens: ComboResolvidoItem[];
  precoOriginal: number;
  precoPromocional: number;
  imagem: string;
}
