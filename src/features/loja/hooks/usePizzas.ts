import { useEffect, useState } from "react";

import { buscarPizzas, PIZZAS_ATUALIZADAS_EVENT } from "../api/loja.service";
import type { Pizza } from "../types/pizza";

export function usePizzas() {
  const [pizzas, setPizzas] = useState<readonly Pizza[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<Error | null>(null);

  useEffect(() => {
    async function carregarPizzas() {
      try {
        setLoading(true);
        setErro(null);
        setPizzas(await buscarPizzas());
      } catch (error) {
        setErro(
          error instanceof Error
            ? error
            : new Error("Não foi possível carregar o cardápio."),
        );
      } finally {
        setLoading(false);
      }
    }

    void carregarPizzas();

    function atualizarCardapio() {
      void carregarPizzas();
    }

    window.addEventListener(PIZZAS_ATUALIZADAS_EVENT, atualizarCardapio);
    window.addEventListener("storage", atualizarCardapio);

    return () => {
      window.removeEventListener(PIZZAS_ATUALIZADAS_EVENT, atualizarCardapio);
      window.removeEventListener("storage", atualizarCardapio);
    };
  }, []);

  return { pizzas, loading, erro };
}
