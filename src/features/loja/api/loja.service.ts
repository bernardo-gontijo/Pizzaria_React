import type { Pizza } from "../types/pizza";

const PIZZAS_URL = "/api/todasAsPizzas.json";
const PIZZAS_STORAGE_KEY = "pizzashop-pizzas";

export const PIZZAS_ATUALIZADAS_EVENT = "pizzashop:pizzas-atualizadas";

export type PizzaInput = Omit<Pizza, "id">;

function lerPizzasSalvas(): Pizza[] | null {
  const dadosSalvos = localStorage.getItem(PIZZAS_STORAGE_KEY);

  if (!dadosSalvos) return null;

  try {
    return JSON.parse(dadosSalvos) as Pizza[];
  } catch {
    localStorage.removeItem(PIZZAS_STORAGE_KEY);
    return null;
  }
}

function salvarPizzas(pizzas: Pizza[]): void {
  localStorage.setItem(PIZZAS_STORAGE_KEY, JSON.stringify(pizzas));
  window.dispatchEvent(new Event(PIZZAS_ATUALIZADAS_EVENT));
}

async function carregarPizzasIniciais(): Promise<Pizza[]> {
  const resposta = await fetch(PIZZAS_URL);

  if (!resposta.ok) {
    throw new Error("Não foi possível carregar o catálogo de pizzas");
  }

  const texto = await resposta.text();

  return texto.trim().length > 0 ? (JSON.parse(texto) as Pizza[]) : [];
}

export async function buscarPizzas(): Promise<Pizza[]> {
  const pizzasSalvas = lerPizzasSalvas();

  if (pizzasSalvas) return pizzasSalvas;

  const pizzasIniciais = await carregarPizzasIniciais();
  salvarPizzas(pizzasIniciais);

  return pizzasIniciais;
}

export async function buscarPizzaPorId(id: string): Promise<Pizza | null> {
  const pizzas = await buscarPizzas();

  return pizzas.find((pizza) => pizza.id === id) ?? null;
}

export async function buscarCategorias(): Promise<string[]> {
  const pizzas = await buscarPizzas();

  return [...new Set(pizzas.map((pizza) => pizza.categoria))];
}

export async function adicionarPizza(dados: PizzaInput): Promise<Pizza> {
  const pizzas = await buscarPizzas();
  const novaPizza: Pizza = { id: crypto.randomUUID(), ...dados };

  salvarPizzas([...pizzas, novaPizza]);

  return novaPizza;
}

export async function editarPizza(
  id: string,
  dados: PizzaInput,
): Promise<Pizza> {
  const pizzas = await buscarPizzas();
  const pizzaAtualizada: Pizza = { id, ...dados };

  salvarPizzas(
    pizzas.map((pizza) => (pizza.id === id ? pizzaAtualizada : pizza)),
  );

  return pizzaAtualizada;
}

export async function excluirPizza(id: string): Promise<void> {
  const pizzas = await buscarPizzas();

  salvarPizzas(pizzas.filter((pizza) => pizza.id !== id));
}

export function filtrarPizzas(
  pizzas: readonly Pizza[],
  filtro: { categoria?: string; busca?: string; disponivel?: boolean },
): Pizza[] {
  let resultado = [...pizzas];

  if (filtro.categoria) {
    resultado = resultado.filter(
      (pizza) => pizza.categoria === filtro.categoria,
    );
  }

  if (filtro.busca) {
    const termo = filtro.busca.toLowerCase();

    resultado = resultado.filter(
      (pizza) =>
        pizza.nome.toLowerCase().includes(termo) ||
        pizza.descricao.toLowerCase().includes(termo) ||
        pizza.ingredientes.some((ingrediente) =>
          ingrediente.toLowerCase().includes(termo),
        ),
    );
  }

  if (filtro.disponivel !== undefined) {
    resultado = resultado.filter(
      (pizza) => pizza.disponivel === filtro.disponivel,
    );
  }

  return resultado;
}
