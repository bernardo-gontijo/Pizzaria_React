import { useCallback, useEffect, useState } from "react";

import {
  atualizarStatusPedido,
  buscarPedidos,
  PEDIDOS_ATUALIZADOS_EVENT,
} from "../../loja/api/pedidos.service";
import type { Pedido, StatusPedidoType } from "../../loja/types/pedido";

export function useAdminPedidos() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const carregarPedidos = useCallback(async () => {
    try {
      setCarregando(true);
      setErro(null);
      setPedidos(await buscarPedidos());
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível carregar os pedidos",
      );
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    function atualizarPedidos() {
      void carregarPedidos();
    }

    window.addEventListener("storage", atualizarPedidos);
    window.addEventListener(PEDIDOS_ATUALIZADOS_EVENT, atualizarPedidos);

    return () => {
      window.removeEventListener("storage", atualizarPedidos);
      window.removeEventListener(PEDIDOS_ATUALIZADOS_EVENT, atualizarPedidos);
    };
  }, [carregarPedidos]);

  async function atualizarStatus(id: string, status: StatusPedidoType) {
    try {
      setErro(null);
      await atualizarStatusPedido(id, { status });
      await carregarPedidos();
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível atualizar o pedido",
      );
    }
  }

  return {
    pedidos,
    carregando,
    erro,
    carregarPedidos,
    atualizarStatus,
  };
}
