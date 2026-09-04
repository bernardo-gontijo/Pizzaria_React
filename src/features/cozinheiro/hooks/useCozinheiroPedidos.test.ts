import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  atualizarStatusPedido,
  buscarPedidos,
} from "../../loja/api/pedidos.service";
import type { Pedido } from "../../loja/types/pedido";

import { useCozinheiroPedidos } from "./useCozinheiroPedidos";

vi.mock("../../loja/api/pedidos.service", () => ({
  buscarPedidos: vi.fn(),
  atualizarStatusPedido: vi.fn(),
  PEDIDOS_ATUALIZADOS_EVENT: "pizzashop:pedidos-atualizados",
}));

const pedidoBase: Pedido = {
  id: "pedido-1",
  cliente: {
    nome: "Cliente Teste",
    telefone: "999999999",
  },
  itens: [
    {
      id: "item-1",
      pizzaId: "pizza-1",
      pizzaName: "Calabresa",
      quantity: 1,
      price: 40,
      size: "M",
    },
  ],
  subtotal: 40,
  taxaEntrega: 0,
  desconto: 0,
  total: 40,
  formaPagamento: "dinheiro",
  status: "pendente",
  statusHistorico: [],
  createdAt: new Date("2026-09-01T20:00:00"),
  updatedAt: new Date("2026-09-01T20:00:00"),
};

describe("useCozinheiroPedidos", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("separa pedidos locais e delivery", async () => {
    const pedidoLocal: Pedido = {
      ...pedidoBase,
      id: "pedido-local",
      mesaId: "mesa-1",
    };

    const pedidoDelivery: Pedido = {
      ...pedidoBase,
      id: "pedido-delivery",
    };

    vi.mocked(buscarPedidos).mockResolvedValue([pedidoLocal, pedidoDelivery]);

    const { result } = renderHook(() => useCozinheiroPedidos());

    await act(async () => {
      await result.current.carregarPedidos();
    });

    expect(result.current.pedidosLocais).toHaveLength(1);
    expect(result.current.pedidosLocais[0].id).toBe("pedido-local");

    expect(result.current.pedidosDelivery).toHaveLength(1);
    expect(result.current.pedidosDelivery[0].id).toBe("pedido-delivery");
  });

  it("ignora pedidos sem itens e pedidos que já estão prontos", async () => {
    const pedidoSemItens: Pedido = {
      ...pedidoBase,
      id: "pedido-vazio",
      mesaId: "mesa-1",
      itens: [],
    };

    const pedidoPronto: Pedido = {
      ...pedidoBase,
      id: "pedido-pronto",
      status: "pronto",
    };

    vi.mocked(buscarPedidos).mockResolvedValue([pedidoSemItens, pedidoPronto]);

    const { result } = renderHook(() => useCozinheiroPedidos());

    await act(async () => {
      await result.current.carregarPedidos();
    });

    expect(result.current.pedidosLocais).toHaveLength(0);
    expect(result.current.pedidosDelivery).toHaveLength(0);
  });

  it("mantém pedidos em preparo na fila da cozinha", async () => {
    const pedidoPreparando: Pedido = {
      ...pedidoBase,
      id: "pedido-preparando",
      status: "preparando",
    };

    vi.mocked(buscarPedidos).mockResolvedValue([pedidoPreparando]);

    const { result } = renderHook(() => useCozinheiroPedidos());

    await act(async () => {
      await result.current.carregarPedidos();
    });

    expect(result.current.pedidosDelivery).toHaveLength(1);
    expect(result.current.pedidosDelivery[0].status).toBe("preparando");
  });

  it("ordena pedidos por prioridade de status", async () => {
    const preparando: Pedido = {
      ...pedidoBase,
      id: "pedido-preparando",
      status: "preparando",
    };

    const confirmado: Pedido = {
      ...pedidoBase,
      id: "pedido-confirmado",
      status: "confirmado",
    };

    const pendente: Pedido = {
      ...pedidoBase,
      id: "pedido-pendente",
      status: "pendente",
    };

    vi.mocked(buscarPedidos).mockResolvedValue([
      preparando,
      confirmado,
      pendente,
    ]);

    const { result } = renderHook(() => useCozinheiroPedidos());

    await act(async () => {
      await result.current.carregarPedidos();
    });

    expect(result.current.pedidosDelivery.map((pedido) => pedido.id)).toEqual([
      "pedido-pendente",
      "pedido-confirmado",
      "pedido-preparando",
    ]);
  });

  it("ordena pedidos do mesmo status do mais antigo para o mais novo", async () => {
    const pedidoNovo: Pedido = {
      ...pedidoBase,
      id: "pedido-novo",
      status: "confirmado",
      createdAt: new Date("2026-09-01T21:00:00"),
    };

    const pedidoAntigo: Pedido = {
      ...pedidoBase,
      id: "pedido-antigo",
      status: "confirmado",
      createdAt: new Date("2026-09-01T19:00:00"),
    };

    vi.mocked(buscarPedidos).mockResolvedValue([pedidoNovo, pedidoAntigo]);

    const { result } = renderHook(() => useCozinheiroPedidos());

    await act(async () => {
      await result.current.carregarPedidos();
    });

    expect(result.current.pedidosDelivery.map((pedido) => pedido.id)).toEqual([
      "pedido-antigo",
      "pedido-novo",
    ]);
  });

  it("calcula corretamente o resumo da cozinha", async () => {
    vi.mocked(buscarPedidos).mockResolvedValue([
      {
        ...pedidoBase,
        id: "pendente-1",
        status: "pendente",
      },
      {
        ...pedidoBase,
        id: "pendente-2",
        status: "pendente",
      },
      {
        ...pedidoBase,
        id: "confirmado-1",
        status: "confirmado",
      },
      {
        ...pedidoBase,
        id: "preparando-1",
        status: "preparando",
      },
    ]);

    const { result } = renderHook(() => useCozinheiroPedidos());

    await act(async () => {
      await result.current.carregarPedidos();
    });

    expect(result.current.resumo).toEqual({
      pendentes: 2,
      confirmados: 1,
      preparando: 1,
      total: 4,
    });
  });

  it("confirma um pedido pendente", async () => {
    vi.mocked(buscarPedidos).mockResolvedValue([pedidoBase]);

    vi.mocked(atualizarStatusPedido).mockResolvedValue({
      ...pedidoBase,
      status: "confirmado",
    });

    const { result } = renderHook(() => useCozinheiroPedidos());

    await act(async () => {
      await result.current.confirmarPedido("pedido-1");
    });

    expect(atualizarStatusPedido).toHaveBeenCalledWith("pedido-1", {
      status: "confirmado",
    });
  });

  it("inicia o preparo de um pedido confirmado", async () => {
    vi.mocked(buscarPedidos).mockResolvedValue([pedidoBase]);

    vi.mocked(atualizarStatusPedido).mockResolvedValue({
      ...pedidoBase,
      status: "preparando",
    });

    const { result } = renderHook(() => useCozinheiroPedidos());

    await act(async () => {
      await result.current.iniciarPreparo("pedido-1");
    });

    expect(atualizarStatusPedido).toHaveBeenCalledWith("pedido-1", {
      status: "preparando",
    });
  });

  it("finaliza o preparo marcando o pedido como pronto", async () => {
    vi.mocked(buscarPedidos).mockResolvedValue([pedidoBase]);

    vi.mocked(atualizarStatusPedido).mockResolvedValue({
      ...pedidoBase,
      status: "pronto",
    });

    const { result } = renderHook(() => useCozinheiroPedidos());

    await act(async () => {
      await result.current.finalizarPreparo("pedido-1");
    });

    expect(atualizarStatusPedido).toHaveBeenCalledWith("pedido-1", {
      status: "pronto",
    });
  });
});
