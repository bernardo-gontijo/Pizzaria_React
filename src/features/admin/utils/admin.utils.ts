import type { OrderStatus } from '../../../store/order.store';

export function formatarMoeda(valor: number): string {
  return valor.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

export function formatarData(data: string): string {
  const dataConvertida = new Date(data);

  if (Number.isNaN(dataConvertida.getTime())) {
    return 'Data inválida';
  }

  return dataConvertida.toLocaleString('pt-BR');
}

export function formatarStatusPedido(status: OrderStatus): string {
  const statusFormatados: Record<OrderStatus, string> = {
    recebido: 'Recebido',
    preparo: 'Em preparo',
    saiu_para_entrega: 'Saiu para entrega',
    entregue: 'Entregue',
  };

  return statusFormatados[status];
}