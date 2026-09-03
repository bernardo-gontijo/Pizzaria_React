export interface Combo {
  readonly id: string;
  readonly nome: string;
  readonly descricao: string;
  readonly itensIncluidos: string[];
  readonly precoOriginal: number;
  readonly precoPromocional: number;
  readonly imagem: string;
  readonly disponivel: boolean;
}