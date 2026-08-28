import type { StatusPedidoType } from "../../loja/types/pedido";

export function formatarMoeda(valor: number): string {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function formatarData(data: string): string {
  const dataConvertida = new Date(data);

  if (Number.isNaN(dataConvertida.getTime())) {
    return "Data inválida";
  }

  return dataConvertida.toLocaleString("pt-BR");
}

export const NOMES_STATUS_PEDIDO: Record<StatusPedidoType, string> = {
  pendente: "Pendente",
  confirmado: "Confirmado",
  preparando: "Em preparo",
  pronto: "Pronto para entrega",
  entregue: "Entregue",
  cancelado: "Cancelado",
};

export function formatarStatusPedido(status: StatusPedidoType): string {
  return NOMES_STATUS_PEDIDO[status];
}
