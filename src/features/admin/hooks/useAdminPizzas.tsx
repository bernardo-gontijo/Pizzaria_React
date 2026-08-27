import { useCallback, useState } from 'react';
import type { Pizza } from '../../loja/types/pizza';
import type { PizzaFormData } from '../components/PizzaForm';

export function useAdminPizzas() {
  const [pizzas, setPizzas] = useState<Pizza[]>([]);

  const [carregando, setCarregando] =
    useState(false);

  const [erro, setErro] =
    useState<string | null>(null);

  const carregarPizzas = useCallback(
    async () => {
      try {
        setCarregando(true);
        setErro(null);

        const resposta = await fetch(
          '/api/todasAsPizzas.json',
        );

        if (!resposta.ok) {
          throw new Error(
            'Não foi possível carregar as pizzas',
          );
        }

        /*
         * O JSON atual do projeto está vazio.
         * Por isso lemos como texto primeiro.
         *
         * Se estiver vazio, usamos [].
         */
        const texto = await resposta.text();

        const dados: Pizza[] =
          texto.trim().length > 0
            ? (JSON.parse(texto) as Pizza[])
            : [];

        setPizzas(dados);
      } catch (error) {
        if (error instanceof Error) {
          setErro(error.message);
        } else {
          setErro(
            'Ocorreu um erro desconhecido',
          );
        }
      } finally {
        setCarregando(false);
      }
    },
    [],
  );

  function adicionarPizza(
    dados: PizzaFormData,
  ) {
    const novaPizza: Pizza = {
      id: crypto.randomUUID(),
      ...dados,
    };

    setPizzas((pizzasAtuais) => [
      ...pizzasAtuais,
      novaPizza,
    ]);
  }

  function editarPizza(
    id: string,
    dados: PizzaFormData,
  ) {
    setPizzas((pizzasAtuais) =>
      pizzasAtuais.map((pizza) =>
        pizza.id === id
          ? {
              ...pizza,
              ...dados,
            }
          : pizza,
      ),
    );
  }

  function excluirPizza(id: string) {
    setPizzas((pizzasAtuais) =>
      pizzasAtuais.filter(
        (pizza) => pizza.id !== id,
      ),
    );
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