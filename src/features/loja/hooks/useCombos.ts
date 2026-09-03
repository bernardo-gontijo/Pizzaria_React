import { useEffect, useState } from "react";

import { buscarCombos } from "../api/combos.service";
import type { Combo } from "../types/combos";

export function useCombos() {
  const [combos, setCombos] = useState<readonly Combo[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<Error | null>(null);

  useEffect(() => {
    async function carregarCombos() {
      try {
        setLoading(true);
        setErro(null);
        setCombos(await buscarCombos());
      } catch (error) {
        setErro(
          error instanceof Error
            ? error
            : new Error("Não foi possível carregar os combos."),
        );
      } finally {
        setLoading(false);
      }
    }

    void carregarCombos();
  }, []);

  return { combos, loading, erro };
}