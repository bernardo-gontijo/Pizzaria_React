import { useEffect, useState } from "react";

import { buscarPizzaPorId, PIZZAS_ATUALIZADAS_EVENT } from "../api/loja.service";
import {
  buscarPromocaoDoDia,
  calcularPrecoComDesconto,
  PROMOCAO_ATUALIZADA_EVENT,
} from "../api/promocao.service";
import type { Pizza } from "../types/pizza";

interface PizzaPromocionalResolvida {
  pizza: Pizza;
  percentualDesconto: number;
  precoComDesconto: number;
}

export function usePromocaoDoDia() {
  const [promocao, setPromocao] = useState<PizzaPromocionalResolvida | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<Error | null>(null);

  useEffect(() => {
    async function carregarPromocao() {
      try {
        setLoading(true);
        setErro(null);

        const promocaoSalva = await buscarPromocaoDoDia();

        if (!promocaoSalva) {
          setPromocao(null);
          return;
        }

        const pizza = await buscarPizzaPorId(promocaoSalva.pizzaId);

        // A pizza referenciada pode ter sido excluída do cardápio
        // depois de virar a promoção do dia — nesse caso não há mais
        // o que exibir, então tratamos como "sem promoção".
        if (!pizza) {
          setPromocao(null);
          return;
        }

        setPromocao({
          pizza,
          percentualDesconto: promocaoSalva.percentualDesconto,
          precoComDesconto: calcularPrecoComDesconto(
            pizza.preco,
            promocaoSalva.percentualDesconto,
          ),
        });
      } catch (error) {
        setErro(
          error instanceof Error
            ? error
            : new Error("Não foi possível carregar a promoção do dia."),
        );
      } finally {
        setLoading(false);
      }
    }

    void carregarPromocao();

    function atualizar() {
      void carregarPromocao();
    }

    window.addEventListener(PROMOCAO_ATUALIZADA_EVENT, atualizar);
    window.addEventListener(PIZZAS_ATUALIZADAS_EVENT, atualizar);
    window.addEventListener("storage", atualizar);

    return () => {
      window.removeEventListener(PROMOCAO_ATUALIZADA_EVENT, atualizar);
      window.removeEventListener(PIZZAS_ATUALIZADAS_EVENT, atualizar);
      window.removeEventListener("storage", atualizar);
    };
  }, []);

  return { promocao, loading, erro };
}