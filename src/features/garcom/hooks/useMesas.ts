import { useCallback, useEffect, useState } from "react";
import {
  buscarMesas,
  criarMesa as criarMesaService,
  removerMesa as removerMesaService,
  MESAS_ATUALIZADAS_EVENT,
} from "../api/mesa.service";
import type { Mesa, MesaInput } from "../types/mesa";

export function useMesas() {
  const [mesas, setMesas] = useState<Mesa[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const carregarMesas = useCallback(async () => {
    try {
      setLoading(true);
      setErro(null);
      const resultado = await buscarMesas();
      setMesas(resultado);
    } catch (error) {
      setErro(
        error instanceof Error ? error.message : "Erro ao carregar mesas",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    window.addEventListener(MESAS_ATUALIZADAS_EVENT, carregarMesas);
    window.addEventListener("storage", carregarMesas);

    return () => {
      window.removeEventListener(MESAS_ATUALIZADAS_EVENT, carregarMesas);
      window.removeEventListener("storage", carregarMesas);
    };
  }, [carregarMesas]);

  async function criarMesa(dados: MesaInput) {
    await criarMesaService(dados);
    await carregarMesas();
  }

  async function removerMesa(id: string) {
    await removerMesaService(id);
    await carregarMesas();
  }

  return { mesas, loading, erro, carregarMesas, criarMesa, removerMesa };
}
