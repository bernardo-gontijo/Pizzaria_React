import { useCallback, useState } from "react";
import {
  buscarMesas,
  abrirMesa,
  adicionarItemNaMesa,
  atualizarQuantidadeItemNaMesa,
  removerItemNaMesa,
  encerrarContaMesa,
} from "../api/mesa.service";
import { buscarPedidoPorId } from "../../loja/api/pedidos.service";
import type { Mesa } from "../types/mesa";
import type { ItemPedido, Pedido } from "../../loja/types/pedido";

export function usePedidoMesa(mesaId: string) {
  const [mesa, setMesa] = useState<Mesa | null>(null);
  const [pedido, setPedido] = useState<Pedido | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    try {
      setLoading(true);
      setErro(null);

      const mesas = await buscarMesas();
      const mesaAtual = mesas.find((m) => m.id === mesaId) ?? null;
      setMesa(mesaAtual);

      if (mesaAtual?.pedidoAtualId) {
        const pedidoAtual = await buscarPedidoPorId(mesaAtual.pedidoAtualId);
        setPedido(pedidoAtual);
      } else {
        setPedido(null);
      }
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Erro ao carregar mesa");
    } finally {
      setLoading(false);
    }
  }, [mesaId]);

  async function abrir() {
    await abrirMesa(mesaId);
    await carregar();
  }

  async function adicionarItem(item: Omit<ItemPedido, "id">) {
    await adicionarItemNaMesa(mesaId, item);
    await carregar();
  }

  async function atualizarQuantidadeItem(itemId: string, quantidade: number) {
    await atualizarQuantidadeItemNaMesa(mesaId, itemId, quantidade);
    await carregar();
  }

  async function removerItem(itemId: string) {
    await removerItemNaMesa(mesaId, itemId);
    await carregar();
  }

  async function encerrarConta(gorjeta?: number) {
    const registro = await encerrarContaMesa(mesaId, gorjeta);
    await carregar();
    return registro;
  }

  return {
    mesa,
    pedido,
    loading,
    erro,
    carregar,
    abrir,
    adicionarItem,
    atualizarQuantidadeItem,
    removerItem,
    encerrarConta,
  };
}