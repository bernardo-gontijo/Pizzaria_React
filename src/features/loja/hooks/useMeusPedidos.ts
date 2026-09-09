import { useCallback, useEffect, useState } from "react";

import { buscarPedidosCliente } from "../api/pedidosCliente.service";
import type { Pedido } from "../types/pedido";

export function useMeusPedidos() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const carregarPedidos = useCallback(async () => {
    try {
      setLoading(true);
      setErro(null);

      const pedidosDoCliente = await buscarPedidosCliente();

      setPedidos(pedidosDoCliente);
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
    void carregarPedidos();
  }, [carregarPedidos]);

  return {
    pedidos,
    loading,
    erro,
    carregarPedidos,
  };
}