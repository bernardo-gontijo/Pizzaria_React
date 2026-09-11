import { useCallback, useEffect, useState } from "react";

import {
  buscarPedidoPorId,
  PEDIDOS_ATUALIZADOS_EVENT,
} from "../api/pedidos.service";
import type { Pedido } from "../types/pedido";

export function usePedidoDetalhes(id?: string) {
  const [pedido, setPedido] = useState<Pedido | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    if (!id) {
      setPedido(null);
      setErro("Pedido não informado.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setErro(null);

      const resultado = await buscarPedidoPorId(id);

      setPedido(resultado);

      if (!resultado) {
        setErro("Pedido não encontrado.");
      }
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível carregar o pedido.",
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void carregar();

    const atualizar = () => {
      void carregar();
    };

    window.addEventListener(
      PEDIDOS_ATUALIZADOS_EVENT,
      atualizar,
    );

    window.addEventListener(
      "storage",
      atualizar,
    );

    return () => {
      window.removeEventListener(
        PEDIDOS_ATUALIZADOS_EVENT,
        atualizar,
      );

      window.removeEventListener(
        "storage",
        atualizar,
      );
    };
  }, [carregar]);

  return {
    pedido,
    loading,
    erro,
    recarregar: carregar,
  };
}