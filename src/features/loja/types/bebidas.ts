export interface Bebida {
  readonly id: string;
  readonly nome: string;
  readonly quantidade: string;
  readonly descricao: string;
  readonly preco: number;
  readonly imagem: string;
  readonly categoria: string;
  readonly disponivel: boolean;
}
