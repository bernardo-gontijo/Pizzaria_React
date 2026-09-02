import { useCallback, useEffect, useMemo, useState } from "react";

import {
  atualizarStatusPedido,
  buscarPedidos,
  PEDIDOS_ATUALIZADOS_EVENT,
} from "../../loja/api/pedidos.service";

import type { Pedido, StatusPedidoType } from "../../loja/types/pedido";

const prioridadeStatus: Record<StatusPedidoType, number> = {
  pendente: 1,
  confirmado: 2,
  preparando: 3,
  pronto: 4,
  saiu_para_entrega: 5,
  entregue: 6,
  cancelado: 7,
};

export function useCozinheiroPedidos() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [pedidoAtualizando, setPedidoAtualizando] = useState<string | null>(
    null,
  );

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

  const pedidosDaCozinha = useMemo(() => {
    return pedidos
      .filter(
        (pedido) =>
          pedido.itens.length > 0 &&
          (pedido.status === "pendente" ||
            pedido.status === "confirmado" ||
            pedido.status === "preparando"),
      )
      .sort((a, b) => {
        const prioridadeA = prioridadeStatus[a.status];
        const prioridadeB = prioridadeStatus[b.status];

        if (prioridadeA !== prioridadeB) {
          return prioridadeA - prioridadeB;
        }

        return (
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      });
  }, [pedidos]);

  const pedidosLocais = useMemo(
    () => pedidosDaCozinha.filter((pedido) => pedido.mesaId !== undefined),
    [pedidosDaCozinha],
  );

  const pedidosDelivery = useMemo(
    () => pedidosDaCozinha.filter((pedido) => pedido.mesaId === undefined),
    [pedidosDaCozinha],
  );

  const resumo = useMemo(
    () => ({
      pendentes: pedidosDaCozinha.filter(
        (pedido) => pedido.status === "pendente",
      ).length,

      confirmados: pedidosDaCozinha.filter(
        (pedido) => pedido.status === "confirmado",
      ).length,

      preparando: pedidosDaCozinha.filter(
        (pedido) => pedido.status === "preparando",
      ).length,

      total: pedidosDaCozinha.length,
    }),
    [pedidosDaCozinha],
  );

  async function alterarStatus(id: string, status: StatusPedidoType) {
    if (pedidoAtualizando === id) {
      return;
    }

    try {
      setErro(null);
      setPedidoAtualizando(id);

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
    } finally {
      setPedidoAtualizando(null);
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
    resumo,
    carregando,
    erro,
    pedidoAtualizando,
    carregarPedidos,
    confirmarPedido,
    iniciarPreparo,
    finalizarPreparo,
  };
}
