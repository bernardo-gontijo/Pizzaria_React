// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";

import {
  cleanup,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";

import type { Pedido } from "../../loja/types/pedido";
import { DashboardPage } from "./DashboardPage";

vi.mock("../api/pedidosAdmin.service", () => ({
  buscarPedidos: vi.fn(),
  atualizarStatusPedido: vi.fn(),
}));

import { buscarPedidos } from "../api/pedidosAdmin.service";

const buscarPedidosMock = vi.mocked(buscarPedidos);

const agora = new Date();

function criarPedidoTeste(overrides: Partial<Pedido>): Pedido {
  return {
    id: "pedido-1",
    cliente: {
      nome: "João",
      telefone: "92999999999",
    },
    endereco: {
      cep: "69000-000",
      rua: "Rua Principal",
      numero: "100",
      bairro: "Centro",
      cidade: "Manaus",
      estado: "AM",
    },
    itens: [],
    subtotal: 50,
    taxaEntrega: 5,
    desconto: 0,
    total: 55,
    formaPagamento: "pix",
    status: "entregue",
    statusHistorico: [],
    createdAt: agora,
    updatedAt: agora,
    ...overrides,
  } as Pedido;
}

const pedidosTeste: Pedido[] = [
  criarPedidoTeste({
    id: "pedido-1",
    cliente: { nome: "João", telefone: "92999999999" },
    subtotal: 50,
    taxaEntrega: 5,
    total: 55,
    status: "entregue",
  }),
  criarPedidoTeste({
    id: "pedido-2",
    cliente: { nome: "Maria", telefone: "92988888888" },
    subtotal: 25,
    taxaEntrega: 5,
    total: 30,
    status: "preparando",
  }),
];

beforeEach(() => {
  buscarPedidosMock.mockReset();
  buscarPedidosMock.mockResolvedValue(pedidosTeste);
});

afterEach(() => {
  cleanup();
});

describe("DashboardPage", () => {
  it("calcula corretamente os dados dos pedidos", async () => {
    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      const totalPedidos = screen
        .getByRole("heading", {
          name: "Total de pedidos",
        })
        .closest("article");

      expect(totalPedidos).not.toBeNull();

      expect(within(totalPedidos!).getByText("2")).toBeInTheDocument();
    });

    const pedidosHoje = screen
      .getByRole("heading", {
        name: "Pedidos de hoje",
      })
      .closest("article");

    expect(within(pedidosHoje!).getByText("2")).toBeInTheDocument();

    const entregues = screen
      .getByRole("heading", {
        name: "Pedidos entregues",
      })
      .closest("article");

    expect(within(entregues!).getByText("1")).toBeInTheDocument();
  });

  it("calcula corretamente o faturamento", async () => {
    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getAllByText("R$ 85,00")).toHaveLength(2);
    });
  });
});
