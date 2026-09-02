export interface Mesa {
  id: string;
  numero: number;
  status: "livre" | "ocupada";
  pedidoAtualId?: string;
}

export type MesaInput = Omit<Mesa, "id" | "status" | "pedidoAtualId">;

export interface HistoricoMesa {
  id: string;
  mesaId: string;
  numeroMesa: number;
  pedidoId: string;
  subtotal: number;
  gorjeta?: number;
  encerradoEm: string;
}
