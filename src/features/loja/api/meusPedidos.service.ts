import { buscarPedidoPorId } from "./pedidos.service";
import type { Pedido } from "../types/pedido";

const MEUS_PEDIDOS_STORAGE_KEY = "pizzashop:meus-pedidos";

export const MEUS_PEDIDOS_ATUALIZADOS_EVENT =
  "pizzashop:meus-pedidos-atualizados";

function lerIdsPedidos(): string[] {
  const dados = localStorage.getItem(MEUS_PEDIDOS_STORAGE_KEY);

  if (!dados) return [];

  try {
    const ids = JSON.parse(dados) as unknown;

    return Array.isArray(ids)
      ? ids.filter((id): id is string => typeof id === "string")
      : [];
  } catch {
    localStorage.removeItem(MEUS_PEDIDOS_STORAGE_KEY);
    return [];
  }
}

export function registrarPedidoOnline(pedidoId: string): void {
  const ids = lerIdsPedidos().filter((id) => id !== pedidoId);

  localStorage.setItem(
    MEUS_PEDIDOS_STORAGE_KEY,
    JSON.stringify([pedidoId, ...ids]),
  );
  window.dispatchEvent(new Event(MEUS_PEDIDOS_ATUALIZADOS_EVENT));
}

export async function buscarMeusPedidos(): Promise<Pedido[]> {
  const pedidos = await Promise.all(
    lerIdsPedidos().map((id) => buscarPedidoPorId(id)),
  );

  return pedidos.filter(
    (pedido): pedido is Pedido =>
      pedido !== null && pedido.mesaId === undefined,
  );
}
