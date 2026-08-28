import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { ReactNode } from "react";

import { CartProvider, useCart } from "./CartContext";
import type { CartItem } from "../store/cart.store";
import type { Pizza } from "../features/loja/types/pizza";

const pizzaTeste: Pizza = {
  id: "pizza-1",
  nome: "Calabresa",
  descricao: "Calabresa fatiada com cebola",
  preco: 45,
  ingredientes: ["calabresa", "cebola", "mussarela"],
  imagem: "/images/pizzas/calabresa.jpg",
  categoria: "tradicional",
  disponivel: true,
};

function criarItem(overrides: Partial<CartItem> = {}): CartItem {
  return {
    id: "item-1",
    nome: pizzaTeste.nome,
    pizza: pizzaTeste,
    tamanho: "media",
    ingredientesExtras: [],
    quantidade: 1,
    precoUnitario: pizzaTeste.preco,
    ...overrides,
  };
}

function wrapper({ children }: { children: ReactNode }) {
  return <CartProvider>{children}</CartProvider>;
}

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  localStorage.clear();
});

describe("CartContext", () => {
  it("inicia vazio quando não há carrinho salvo", () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    expect(result.current.items).toEqual([]);
    expect(result.current.subtotal).toBe(0);
  });

  it("adiciona um item ao carrinho", () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.adicionarItem(criarItem());
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].nome).toBe("Calabresa");
  });

  it("calcula subtotal e total somando taxa de entrega", () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.adicionarItem(
        criarItem({ id: "item-1", precoUnitario: 45, quantidade: 2 }),
      );
      result.current.adicionarItem(
        criarItem({ id: "item-2", precoUnitario: 30, quantidade: 1 }),
      );
    });

    // subtotal = 45*2 + 30*1 = 120
    expect(result.current.subtotal).toBe(120);
    expect(result.current.total).toBe(
      result.current.subtotal + result.current.taxaEntrega,
    );
  });

  it("remove um item do carrinho", () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.adicionarItem(criarItem({ id: "item-1" }));
      result.current.adicionarItem(criarItem({ id: "item-2" }));
    });

    act(() => {
      result.current.removerItem("item-1");
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].id).toBe("item-2");
  });

  it("altera a quantidade de um item", () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.adicionarItem(criarItem({ id: "item-1", quantidade: 1 }));
    });

    act(() => {
      result.current.alterarQuantidade("item-1", 4);
    });

    expect(result.current.items[0].quantidade).toBe(4);
  });

  it("limpa o carrinho por completo", () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.adicionarItem(criarItem({ id: "item-1" }));
      result.current.adicionarItem(criarItem({ id: "item-2" }));
    });

    act(() => {
      result.current.limparCarrinho();
    });

    expect(result.current.items).toEqual([]);
    expect(result.current.subtotal).toBe(0);
  });

  it("persiste o carrinho no localStorage entre montagens", () => {
    const { result, unmount } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.adicionarItem(criarItem({ id: "item-1" }));
    });

    unmount();

    const { result: novoResultado } = renderHook(() => useCart(), {
      wrapper,
    });

    expect(novoResultado.current.items).toHaveLength(1);
    expect(novoResultado.current.items[0].id).toBe("item-1");
  });

  it("lança erro se useCart for usado fora do CartProvider", () => {
    expect(() => renderHook(() => useCart())).toThrow(
      "useCart deve ser utilizado dentro de CartProvider",
    );
  });
});