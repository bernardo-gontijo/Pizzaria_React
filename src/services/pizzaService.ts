import { api } from './api';
import type { Pizza, PizzaFilter } from '../types/pizza';

export async function listarPizzas(): Promise<Pizza[]> {
  return api.get<Pizza[]>('/pizzas');
}

export async function buscarPizza(id: string): Promise<Pizza> {
  return api.get<Pizza>(`/pizzas/${id}`);
}

export async function criarPizza(pizza: Omit<Pizza, 'id'>): Promise<Pizza> {
  return api.post<Pizza>('/pizzas', pizza);
}

export async function atualizarPizza(
  id: string,
  pizza: Partial<Pizza>,
): Promise<Pizza> {
  return api.put<Pizza>(`/pizzas/${id}`, pizza);
}

export async function removerPizza(id: string): Promise<void> {
  await api.delete(`/pizzas/${id}`);
}

export function filtrarPizzas(
  pizzas: Pizza[],
  filtros: PizzaFilter,
): Pizza[] {
  return pizzas.filter((pizza) => {
    const correspondeCategoria =
      !filtros.categoria || pizza.categoria === filtros.categoria;

    const correspondeIngrediente =
      !filtros.ingrediente ||
      pizza.ingredientes.some((ingrediente) =>
        ingrediente
          .toLowerCase()
          .includes(filtros.ingrediente!.toLowerCase()),
      );

    const correspondeBusca =
      !filtros.busca ||
      pizza.nome.toLowerCase().includes(filtros.busca.toLowerCase());

    return (
      correspondeCategoria &&
      correspondeIngrediente &&
      correspondeBusca
    );
  });
}