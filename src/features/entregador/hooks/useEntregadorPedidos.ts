import { useCallback, useEffect, useMemo, useState } from "react";

import {
  pedidosService,
  PEDIDOS_ATUALIZADOS_EVENT,
} from "../services/pedidos.service";
import type { Pedido } from "../../loja/types/pedido";

export function useEntregadorPedidos() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pedidoAtualizando, setPedidoAtualizando] = useState<string | null>(
    null,
  );

  const carregarPedidos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const todosPedidos = await pedidosService.listarPedidos();
      setPedidos(todosPedidos.filter((pedido) => pedido.mesaId === undefined));
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Não foi possível carregar os pedidos para entrega.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const carregamentoInicial = window.setTimeout(() => {
      void carregarPedidos();
    }, 0);

    function atualizarLista() {
      void carregarPedidos();
    }

    window.addEventListener(PEDIDOS_ATUALIZADOS_EVENT, atualizarLista);
    window.addEventListener("storage", atualizarLista);

    return () => {
      window.clearTimeout(carregamentoInicial);
      window.removeEventListener(PEDIDOS_ATUALIZADOS_EVENT, atualizarLista);
      window.removeEventListener("storage", atualizarLista);
    };
  }, [carregarPedidos]);

  const pedidosProntos = useMemo(
    () => pedidos.filter((pedido) => pedido.status === "pronto"),
    [pedidos],
  );

  const pedidosEmRota = useMemo(
    () => pedidos.filter((pedido) => pedido.status === "saiu_para_entrega"),
    [pedidos],
  );

  const pedidosEntregues = useMemo(
    () => pedidos.filter((pedido) => pedido.status === "entregue"),
    [pedidos],
  );

  const atualizarStatus = useCallback(
    async (pedidoId: string, status: "saiu_para_entrega" | "entregue") => {
      try {
        setPedidoAtualizando(pedidoId);
        setError(null);
        await pedidosService.atualizarStatusPedido(pedidoId, status);
        await carregarPedidos();
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Não foi possível atualizar o pedido.",
        );
      } finally {
        setPedidoAtualizando(null);
      }
    },
    [carregarPedidos],
  );

  const saiuParaEntrega = useCallback(
    async (pedidoId: string) => {
      await atualizarStatus(pedidoId, "saiu_para_entrega");
    },
    [atualizarStatus],
  );

  const marcarEntregue = useCallback(
    async (pedidoId: string) => {
      await atualizarStatus(pedidoId, "entregue");
    },
    [atualizarStatus],
  );

  return {
    pedidosProntos,
    pedidosEmRota,
    pedidosEntregues,
    loading,
    error,
    pedidoAtualizando,
    saiuParaEntrega,
    marcarEntregue,
    carregarPedidos,
  };
}
