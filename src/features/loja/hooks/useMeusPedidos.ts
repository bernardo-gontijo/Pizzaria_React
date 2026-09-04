import { useCallback, useEffect, useState } from "react";

import {
  buscarMeusPedidos,
  MEUS_PEDIDOS_ATUALIZADOS_EVENT,
} from "../api/meusPedidos.service";
import { PEDIDOS_ATUALIZADOS_EVENT } from "../api/pedidos.service";
import type { Pedido } from "../types/pedido";

export function useMeusPedidos() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const carregarPedidos = useCallback(async () => {
    try {
      setLoading(true);
      setErro(null);
      setPedidos(await buscarMeusPedidos());
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível carregar seus pedidos.",
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
    window.addEventListener(MEUS_PEDIDOS_ATUALIZADOS_EVENT, atualizarLista);
    window.addEventListener("storage", atualizarLista);

    return () => {
      window.clearTimeout(carregamentoInicial);
      window.removeEventListener(PEDIDOS_ATUALIZADOS_EVENT, atualizarLista);
      window.removeEventListener(
        MEUS_PEDIDOS_ATUALIZADOS_EVENT,
        atualizarLista,
      );
      window.removeEventListener("storage", atualizarLista);
    };
  }, [carregarPedidos]);

  return { pedidos, loading, erro, carregarPedidos };
}
