import { useCallback, useEffect, useMemo, useState } from "react";

import {
  atualizarStatusPedido,
  buscarPedidos,
  PEDIDOS_ATUALIZADOS_EVENT,
} from "../../loja/api/pedidos.service";

import type { Pedido, StatusPedidoType } from "../../loja/types/pedido";

export function useCozinheiroPedidos() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const carregarPedidos = useCallback(async () => {
    try {
      setCarregando(true);
      setErro(null);

      const pedidosCarregados = await buscarPedidos();

      setPedidos(pedidosCarregados);
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
    function atualizarLista() {
      void carregarPedidos();
    }

    window.addEventListener(PEDIDOS_ATUALIZADOS_EVENT, atualizarLista);

    window.addEventListener("storage", atualizarLista);

    return () => {
      window.removeEventListener(PEDIDOS_ATUALIZADOS_EVENT, atualizarLista);

      window.removeEventListener("storage", atualizarLista);
    };
  }, [carregarPedidos]);

  const pedidosDaCozinha = useMemo(
    () =>
      pedidos.filter(
        (pedido) =>
          pedido.itens.length > 0 &&
          (pedido.status === "pendente" ||
            pedido.status === "confirmado" ||
            pedido.status === "preparando"),
      ),
    [pedidos],
  );

  const pedidosLocais = useMemo(
    () => pedidosDaCozinha.filter((pedido) => pedido.mesaId !== undefined),
    [pedidosDaCozinha],
  );

  const pedidosDelivery = useMemo(
    () => pedidosDaCozinha.filter((pedido) => pedido.mesaId === undefined),
    [pedidosDaCozinha],
  );

  async function alterarStatus(id: string, status: StatusPedidoType) {
    try {
      setErro(null);

      await atualizarStatusPedido(id, {
        status,
      });

      await carregarPedidos();
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível atualizar o pedido",
      );
    }
  }

  async function confirmarPedido(id: string) {
    await alterarStatus(id, "confirmado");
  }

  async function iniciarPreparo(id: string) {
    await alterarStatus(id, "preparando");
  }

  async function finalizarPreparo(id: string) {
    await alterarStatus(id, "pronto");
  }

  return {
    pedidosLocais,
    pedidosDelivery,
    carregando,
    erro,
    carregarPedidos,
    confirmarPedido,
    iniciarPreparo,
    finalizarPreparo,
  };
}
