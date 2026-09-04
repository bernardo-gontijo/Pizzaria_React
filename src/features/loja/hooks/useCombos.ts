import { useEffect, useState } from "react";

import {
  buscarCombosResolvidos,
  COMBOS_ATUALIZADOS_EVENT,
} from "../api/combos.service";
import { PIZZAS_ATUALIZADAS_EVENT } from "../api/loja.service";
import type { ComboResolvido } from "../types/combos";

export function useCombos() {
  const [combos, setCombos] = useState<readonly ComboResolvido[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<Error | null>(null);

  useEffect(() => {
    async function carregarCombos() {
      try {
        setLoading(true);
        setErro(null);
        setCombos(await buscarCombosResolvidos());
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

    function atualizarCombos() {
      void carregarCombos();
    }

    window.addEventListener(COMBOS_ATUALIZADOS_EVENT, atualizarCombos);
    window.addEventListener(PIZZAS_ATUALIZADAS_EVENT, atualizarCombos);
    window.addEventListener("storage", atualizarCombos);

    return () => {
      window.removeEventListener(COMBOS_ATUALIZADOS_EVENT, atualizarCombos);
      window.removeEventListener(PIZZAS_ATUALIZADAS_EVENT, atualizarCombos);
      window.removeEventListener("storage", atualizarCombos);
    };
  }, []);

  return { combos, loading, erro };
}
