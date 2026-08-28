import { useCallback, useState } from "react";

import {
  adicionarPizza as adicionarPizzaService,
  buscarPizzas,
  editarPizza as editarPizzaService,
  excluirPizza as excluirPizzaService,
} from "../../loja/api/loja.service";
import type { Pizza } from "../../loja/types/pizza";
import type { PizzaFormData } from "../components/PizzaForm";

export function useAdminPizzas() {
  const [pizzas, setPizzas] = useState<Pizza[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const carregarPizzas = useCallback(async () => {
    try {
      setCarregando(true);
      setErro(null);
      setPizzas(await buscarPizzas());
    } catch (error) {
      setErro(
        error instanceof Error ? error.message : "Ocorreu um erro desconhecido",
      );
    } finally {
      setCarregando(false);
    }
  }, []);

  async function adicionarPizza(dados: PizzaFormData) {
    await adicionarPizzaService(dados);
    await carregarPizzas();
  }

  async function editarPizza(id: string, dados: PizzaFormData) {
    await editarPizzaService(id, dados);
    await carregarPizzas();
  }

  async function excluirPizza(id: string) {
    await excluirPizzaService(id);
    await carregarPizzas();
  }

  return {
    pizzas,
    carregando,
    erro,
    carregarPizzas,
    adicionarPizza,
    editarPizza,
    excluirPizza,
  };
}
