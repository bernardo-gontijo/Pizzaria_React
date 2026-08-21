import { api } from './api';
import type { Order, OrderStatus } from '../types/order';

export async function criarPedido(
  pedido: Omit<Order, 'id'>,
): Promise<Order> {
  return api.post<Order>('/pedidos', pedido);
}

export async function listarPedidos(): Promise<Order[]> {
  return api.get<Order[]>('/pedidos');
}

export async function buscarPedido(
  id: string,
): Promise<Order> {
  return api.get<Order>(`/pedidos/${id}`);
}

export async function atualizarStatusPedido(
  id: string,
  status: OrderStatus,
): Promise<Order> {
  return api.patch<Order>(`/pedidos/${id}`, {
    status,
  });
}