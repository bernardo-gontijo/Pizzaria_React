// @vitest-environment jsdom

import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  atualizarStatusPedido,
  buscarPedidos,
} from "../../loja/api/pedidos.service";
import type { Pedido, StatusPedidoType } from "../../loja/types/pedido";
import { useCozinheiroPedidos } from "./useCozinheiroPedidos";

vi.mock("../../loja/api/pedidos.service", () => ({
  buscarPedidos: vi.fn(),
  atualizarStatusPedido: vi.fn(),
  PEDIDOS_ATUALIZADOS_EVENT: "pizzashop:pedidos-atualizados",
}));

const buscarPedidosMock = vi.mocked(buscarPedidos);
const atualizarStatusPedidoMock = vi.mocked(atualizarStatusPedido);

function criarPedido(id: string, status: StatusPedidoType): Pedido {
  return {
    id,
    cliente: {
      nome: "Cliente Teste",
      telefone: "92999999999",
    },
    endereco: {
      cep: "69000-000",
      rua: "Rua Teste",
      numero: "100",
      bairro: "Centro",
      cidade: "Manaus",
      estado: "AM",
    },
    itens: [
      {
        id: `item-${id}`,
        pizzaId: "pizza-001",
        pizzaName: "Calabresa",
        quantity: 1,
        price: 35,
        size: "G",
      },
    ],
    subtotal: 35,
    taxaEntrega: 5,
    desconto: 0,
    total: 40,
    formaPagamento: "pix",
    status,
    statusHistorico: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  cleanup();
});

describe("useCozinheiroPedidos", () => {
  it("mostra apenas pedidos pendentes ou confirmados", async () => {
    buscarPedidosMock.mockResolvedValue([
      criarPedido("pedido-1", "pendente"),
      criarPedido("pedido-2", "confirmado"),
      criarPedido("pedido-3", "preparando"),
      criarPedido("pedido-4", "entregue"),
    ]);

    const { result } = renderHook(() => useCozinheiroPedidos());

    await act(async () => {
      await result.current.carregarPedidos();
    });

    expect(result.current.pedidos).toHaveLength(2);
    expect(result.current.pedidos[0].id).toBe("pedido-1");
    expect(result.current.pedidos[1].id).toBe("pedido-2");
  });

  it("confirma um pedido pendente", async () => {
    buscarPedidosMock.mockResolvedValue([]);
    atualizarStatusPedidoMock.mockResolvedValue(
      criarPedido("pedido-1", "confirmado"),
    );

    const { result } = renderHook(() => useCozinheiroPedidos());

    await act(async () => {
      await result.current.confirmarPedido("pedido-1");
    });

    expect(atualizarStatusPedidoMock).toHaveBeenCalledWith("pedido-1", {
      status: "confirmado",
    });
  });

  it("avança um pedido confirmado para preparando", async () => {
    buscarPedidosMock.mockResolvedValue([]);
    atualizarStatusPedidoMock.mockResolvedValue(
      criarPedido("pedido-1", "preparando"),
    );

    const { result } = renderHook(() => useCozinheiroPedidos());

    await act(async () => {
      await result.current.iniciarPreparo("pedido-1");
    });

    expect(atualizarStatusPedidoMock).toHaveBeenCalledWith("pedido-1", {
      status: "preparando",
    });
  });
});
