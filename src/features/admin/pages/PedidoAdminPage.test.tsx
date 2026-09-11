// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";

import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { Pedido } from "../../loja/types/pedido";
import { PedidoAdminPage } from "./PedidoAdminPage";

vi.mock("../api/pedidosAdmin.service", () => ({
  buscarPedidos: vi.fn(),
  atualizarStatusPedido: vi.fn(),
}));

import {
  atualizarStatusPedido,
  buscarPedidos,
} from "../api/pedidosAdmin.service";

const buscarPedidosMock = vi.mocked(buscarPedidos);
const atualizarStatusPedidoMock = vi.mocked(atualizarStatusPedido);

const agora = new Date();

const pedidoTeste = {
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
  status: "pendente",
  statusHistorico: [],
  createdAt: agora,
  updatedAt: agora,
} as unknown as Pedido;

beforeEach(() => {
  buscarPedidosMock.mockReset();
  atualizarStatusPedidoMock.mockReset();

  buscarPedidosMock.mockResolvedValue([pedidoTeste]);
});

afterEach(() => {
  cleanup();
});

describe("PedidoAdminPage", () => {
  it("carrega os pedidos cadastrados", async () => {
    render(<PedidoAdminPage />);

    expect(await screen.findByText("João")).toBeInTheDocument();

    expect(screen.getByText("R$ 55,00")).toBeInTheDocument();

    const status = screen.getByLabelText("Status do pedido pedido-1");

    expect(status).toHaveValue("pendente");
  });

  it("permite alterar o status do pedido", async () => {
    const pedidoAtualizado = { ...pedidoTeste, status: "preparando" as const };

    atualizarStatusPedidoMock.mockResolvedValue(pedidoAtualizado);

    render(<PedidoAdminPage />);

    const campoStatus = await screen.findByLabelText(
      "Status do pedido pedido-1",
      {},
      { timeout: 3000 },
    );

    buscarPedidosMock.mockResolvedValue([pedidoAtualizado]);

    fireEvent.change(campoStatus, {
      target: {
        value: "preparando",
      },
    });

    await waitFor(
      () => {
        expect(screen.getByLabelText("Status do pedido pedido-1")).toHaveValue(
          "preparando",
        );
      },
      { timeout: 5000 },
    );

    expect(atualizarStatusPedidoMock).toHaveBeenCalledWith("pedido-1", {
      status: "preparando",
    });
  }, 10000);
});
