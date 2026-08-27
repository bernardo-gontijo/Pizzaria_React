import {
  useEffect,
  useState,
} from 'react';

import type { Pizza } from '../../loja/types/pizza';

import {
  PizzaForm,
  type PizzaFormData,
} from '../components/PizzaForm';

import { useAdminPizzas } from '../hooks/useAdminPizzas';

export function PizzasPage() {
  const {
    pizzas,
    carregando,
    erro,
    carregarPizzas,
    adicionarPizza,
    editarPizza,
    excluirPizza,
  } = useAdminPizzas();

  const [pizzaEditando, setPizzaEditando] =
    useState<Pizza | undefined>(
      undefined,
    );

  useEffect(() => {
    void carregarPizzas();
  }, [carregarPizzas]);

  function handleSubmit(
    dados: PizzaFormData,
  ) {
    if (pizzaEditando) {
      editarPizza(
        pizzaEditando.id,
        dados,
      );

      setPizzaEditando(undefined);

      return;
    }

    adicionarPizza(dados);
  }

  function handleEditar(
    pizza: Pizza,
  ) {
    setPizzaEditando(pizza);
  }

  function handleExcluir(
    id: string,
  ) {
    const confirmou =
      window.confirm(
        'Tem certeza que deseja excluir esta pizza?',
      );

    if (!confirmou) {
      return;
    }

    excluirPizza(id);

    if (pizzaEditando?.id === id) {
      setPizzaEditando(undefined);
    }
  }

  return (
    <main>
      <h1>
        Gerenciamento de Pizzas
      </h1>

      <PizzaForm
        key={
          pizzaEditando?.id ??
          'nova-pizza'
        }
        pizza={pizzaEditando}
        onSubmit={handleSubmit}
        onCancel={() =>
          setPizzaEditando(undefined)
        }
      />

      <hr />

      <h2>Cardápio</h2>

      {carregando && (
        <p>Carregando pizzas...</p>
      )}

      {erro && (
        <p role="alert">
          {erro}
        </p>
      )}

      {!carregando &&
        !erro &&
        pizzas.length === 0 && (
          <p>
            Nenhuma pizza cadastrada.
          </p>
        )}

      {pizzas.map((pizza) => (
        <article key={pizza.id}>
          <h3>{pizza.nome}</h3>

          <p>
            {pizza.descricao}
          </p>

          <p>
            <strong>
              Preço:
            </strong>{' '}
            {pizza.preco.toLocaleString(
              'pt-BR',
              {
                style: 'currency',
                currency: 'BRL',
              },
            )}
          </p>

          <p>
            <strong>
              Categoria:
            </strong>{' '}
            {pizza.categoria}
          </p>

          <p>
            <strong>
              Ingredientes:
            </strong>{' '}
            {pizza.ingredientes.join(
              ', ',
            )}
          </p>

          <p>
            <strong>
              Status:
            </strong>{' '}
            {pizza.disponivel
              ? 'Disponível'
              : 'Indisponível'}
          </p>

          {pizza.imagem && (
            <img
              src={pizza.imagem}
              alt={`Pizza ${pizza.nome}`}
              width="200"
            />
          )}

          <div>
            <button
              type="button"
              onClick={() =>
                handleEditar(pizza)
              }
            >
              Editar
            </button>

            <button
              type="button"
              onClick={() =>
                handleExcluir(
                  pizza.id,
                )
              }
            >
              Excluir
            </button>
          </div>

          <hr />
        </article>
      ))}
    </main>
  );
}