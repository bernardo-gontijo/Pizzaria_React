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
    let cancelado = false;

    async function carregarInicial() {
      if (!id) {
        if (!cancelado) {
          setPedido(null);
          setErro("Pedido não informado.");
          setLoading(false);
        }
        return;
      }

      try {
        setLoading(true);
        setErro(null);

        const resultado = await buscarPedidoPorId(id);

        if (!cancelado) {
          setPedido(resultado);

          if (!resultado) {
            setErro("Pedido não encontrado.");
          }
        }
      } catch (error) {
        if (!cancelado) {
          setErro(
            error instanceof Error
              ? error.message
              : "Não foi possível carregar o pedido.",
          );
        }
      } finally {
        if (!cancelado) setLoading(false);
      }
    }

    void carregarInicial();

    window.addEventListener(PEDIDOS_ATUALIZADOS_EVENT, carregar);
    window.addEventListener("storage", carregar);

    return () => {
      cancelado = true;
      window.removeEventListener(PEDIDOS_ATUALIZADOS_EVENT, carregar);
      window.removeEventListener("storage", carregar);
    };
  }, [id, carregar]);

  return {
    pedido,
    loading,
    erro,
    recarregar: carregar,
  };
}
