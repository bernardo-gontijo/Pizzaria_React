import { useEffect, useState } from "react";

import { buscarBebidas } from "../api/bebidas.service";
import type { Bebida } from "../types/bebidas";

export function useBebidas() {
  const [bebidas, setBebidas] = useState<readonly Bebida[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<Error | null>(null);

  useEffect(() => {
    async function carregarBebidas() {
      try {
        setLoading(true);
        setErro(null);
        setBebidas(await buscarBebidas());
      } catch (error) {
        setErro(
          error instanceof Error
            ? error
            : new Error("Não foi possível carregar as bebidas."),
        );
      } finally {
        setLoading(false);
      }
    }

    void carregarBebidas();
  }, []);

  return { bebidas, loading, erro };
}
