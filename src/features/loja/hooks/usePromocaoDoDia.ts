import { useEffect, useState } from "react";

import { buscarPizzaPorId } from "../api/loja.service";
import {
  buscarPromocaoDoDia,
  calcularPrecoComDesconto,
  PROMOCAO_ATUALIZADA_EVENT,
} from "../api/promocao.service";
import type { Pizza } from "../types/pizza";

export interface PromocaoDoDiaEnriquecida {
  pizza: Pizza;
  percentualDesconto: number;
  precoComDesconto: number;
}

export function usePromocaoDoDia() {
  const [promocao, setPromocao] = useState(
    null as PromocaoDoDiaEnriquecida | null,
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelado = false;

    async function carregar() {
      try {
        setLoading(true);

        const salva = await buscarPromocaoDoDia();

        if (!salva) {
          if (!cancelado) setPromocao(null);
          return;
        }

        const pizza = await buscarPizzaPorId(salva.pizzaId);

        if (!pizza) {
          if (!cancelado) setPromocao(null);
          return;
        }

        if (!cancelado) {
          setPromocao({
            pizza,
            percentualDesconto: salva.percentualDesconto,
            precoComDesconto: calcularPrecoComDesconto(
              pizza.preco,
              salva.percentualDesconto,
            ),
          });
        }
      } finally {
        if (!cancelado) setLoading(false);
      }
    }

    void carregar();

    window.addEventListener(PROMOCAO_ATUALIZADA_EVENT, carregar);

    return () => {
      cancelado = true;
      window.removeEventListener(PROMOCAO_ATUALIZADA_EVENT, carregar);
    };
  }, []);

  return { promocao, loading };
}
