import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { ReactNode } from "react";

import { CartProvider, useCart, type CartItem } from "./CartContext";
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
        criarItem({
          id: "item-1",
          precoUnitario: 45,
          quantidade: 2,
        }),
      );

      result.current.adicionarItem(
        criarItem({
          id: "item-2",
          precoUnitario: 30,
          quantidade: 1,
        }),
      );
    });

    expect(result.current.subtotal).toBe(120);

    expect(result.current.total).toBe(
      result.current.subtotal + result.current.taxaEntrega,
    );
  });

  it("remove um item do carrinho", () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.adicionarItem(
        criarItem({
          id: "item-1",
        }),
      );

      result.current.adicionarItem(
        criarItem({
          id: "item-2",
        }),
      );
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
      result.current.adicionarItem(
        criarItem({
          id: "item-1",
          quantidade: 1,
        }),
      );
    });

    act(() => {
      result.current.alterarQuantidade("item-1", 4);
    });

    expect(result.current.items[0].quantidade).toBe(4);
  });

  it("limpa o carrinho por completo", () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.adicionarItem(
        criarItem({
          id: "item-1",
        }),
      );

      result.current.adicionarItem(
        criarItem({
          id: "item-2",
        }),
      );
    });

    act(() => {
      result.current.limparCarrinho();
    });

    expect(result.current.items).toEqual([]);
    expect(result.current.subtotal).toBe(0);
  });

  it("persiste o carrinho no localStorage entre montagens", () => {
    const { result, unmount } = renderHook(() => useCart(), {
      wrapper,
    });

    act(() => {
      result.current.adicionarItem(
        criarItem({
          id: "item-1",
        }),
      );
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

  it("aplica um cupom ao carrinho", () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.adicionarItem(
        criarItem({
          precoUnitario: 80,
        }),
      );
    });

    act(() => {
      result.current.aplicarCupom({
        codigo: "PIZZA10",
        tipoDesconto: "percentual",
        valor: 10,
        desconto: 8,
      });
    });

    expect(result.current.cupomAplicado).toEqual({
      codigo: "PIZZA10",
      tipoDesconto: "percentual",
      valor: 10,
      desconto: 8,
    });

    expect(result.current.desconto).toBe(8);
  });

  it("calcula o total considerando o desconto do cupom", () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.adicionarItem(
        criarItem({
          precoUnitario: 80,
        }),
      );
    });

    act(() => {
      result.current.aplicarCupom({
        codigo: "PIZZA10",
        tipoDesconto: "percentual",
        valor: 10,
        desconto: 8,
      });
    });

    expect(result.current.subtotal).toBe(80);
    expect(result.current.desconto).toBe(8);

    // 80 + 5 de entrega - 8 de desconto = 77
    expect(result.current.total).toBe(77);
  });

  it("remove um cupom aplicado", () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.adicionarItem(
        criarItem({
          precoUnitario: 80,
        }),
      );
    });

    act(() => {
      result.current.aplicarCupom({
        codigo: "PIZZA10",
        tipoDesconto: "percentual",
        valor: 10,
        desconto: 8,
      });
    });

    act(() => {
      result.current.removerCupom();
    });

    expect(result.current.cupomAplicado).toBeNull();
    expect(result.current.desconto).toBe(0);
    expect(result.current.total).toBe(85);
  });

  it("remove o cupom quando a quantidade de um item muda", () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.adicionarItem(
        criarItem({
          id: "item-1",
        }),
      );
    });

    act(() => {
      result.current.aplicarCupom({
        codigo: "PIZZA10",
        tipoDesconto: "percentual",
        valor: 10,
        desconto: 4.5,
      });
    });

    act(() => {
      result.current.alterarQuantidade("item-1", 2);
    });

    expect(result.current.cupomAplicado).toBeNull();
    expect(result.current.desconto).toBe(0);
  });

  it("remove o cupom quando um item é removido", () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.adicionarItem(
        criarItem({
          id: "item-1",
        }),
      );

      result.current.adicionarItem(
        criarItem({
          id: "item-2",
        }),
      );
    });

    act(() => {
      result.current.aplicarCupom({
        codigo: "PIZZA10",
        tipoDesconto: "percentual",
        valor: 10,
        desconto: 9,
      });
    });

    act(() => {
      result.current.removerItem("item-1");
    });

    expect(result.current.cupomAplicado).toBeNull();
    expect(result.current.desconto).toBe(0);
  });

  it("remove o cupom quando um novo item é adicionado", () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.adicionarItem(
        criarItem({
          id: "item-1",
        }),
      );
    });

    act(() => {
      result.current.aplicarCupom({
        codigo: "PIZZA10",
        tipoDesconto: "percentual",
        valor: 10,
        desconto: 4.5,
      });
    });

    act(() => {
      result.current.adicionarItem(
        criarItem({
          id: "item-2",
        }),
      );
    });

    expect(result.current.cupomAplicado).toBeNull();
    expect(result.current.desconto).toBe(0);
  });

  it("remove o cupom quando o carrinho é limpo", () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.adicionarItem(criarItem());
    });

    act(() => {
      result.current.aplicarCupom({
        codigo: "PIZZA10",
        tipoDesconto: "percentual",
        valor: 10,
        desconto: 4.5,
      });
    });

    act(() => {
      result.current.limparCarrinho();
    });

    expect(result.current.items).toEqual([]);
    expect(result.current.cupomAplicado).toBeNull();
    expect(result.current.desconto).toBe(0);
  });
});
