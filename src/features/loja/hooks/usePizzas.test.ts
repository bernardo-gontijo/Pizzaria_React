import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { usePizzas } from "./usePizzas";
import type { Pizza } from "../types/pizza";

const pizzasTeste: Pizza[] = [
  {
    id: "pizza-1",
    nome: "Calabresa",
    descricao: "Calabresa fatiada com cebola",
    preco: 45,
    ingredientes: ["calabresa", "cebola", "mussarela"],
    imagem: "/images/pizzas/calabresa.jpg",
    categoria: "tradicional",
    disponivel: true,
  },
  {
    id: "pizza-2",
    nome: "Marguerita",
    descricao: "Tomate, manjericão e mussarela",
    preco: 50,
    ingredientes: ["tomate", "manjericao", "mussarela"],
    imagem: "/images/pizzas/marguerita.jpg",
    categoria: "tradicional",
    disponivel: true,
  },
];

beforeEach(() => {
  // buscarPizzas() agora cacheia o resultado no localStorage; sem
  // limpar entre os testes, um teste "vazaria" dados para o próximo.
  localStorage.clear();
});

afterEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

describe("usePizzas", () => {
  it("inicia em estado de carregamento", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      text: async () => JSON.stringify(pizzasTeste),
    } as Response);

    const { result } = renderHook(() => usePizzas());

    expect(result.current.loading).toBe(true);
    expect(result.current.pizzas).toEqual([]);
    expect(result.current.erro).toBeNull();

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
  });

  it("carrega as pizzas com sucesso", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      text: async () => JSON.stringify(pizzasTeste),
    } as Response);

    const { result } = renderHook(() => usePizzas());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.pizzas).toEqual(pizzasTeste);
    expect(result.current.erro).toBeNull();
  });

  it("retorna erro quando a resposta não é ok", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: false,
      text: async () => "",
    } as Response);

    const { result } = renderHook(() => usePizzas());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.pizzas).toEqual([]);
    expect(result.current.erro).not.toBeNull();
    expect(result.current.erro?.message).toBe(
      "Não foi possível carregar o catálogo de pizzas",
    );
  });

  it("retorna erro quando o fetch rejeita (ex: sem conexão)", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("Falha de rede"));

    const { result } = renderHook(() => usePizzas());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.pizzas).toEqual([]);
    expect(result.current.erro?.message).toBe("Falha de rede");
  });
});
