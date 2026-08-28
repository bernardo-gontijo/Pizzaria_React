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
import type { PedidoAdminPage as PedidoAdminPageComponent } from "./PedidoAdminPage";

const agora = new Date().toISOString();

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

let PedidoAdminPage: typeof PedidoAdminPageComponent;

beforeEach(async () => {
  localStorage.clear();

  // Chave usada por pedidos.service.ts (initPedidos), que estrutura os
  // pedidos de forma diferente do antigo store/order.store.ts.
  localStorage.setItem("pedidos_loja", JSON.stringify([pedidoTeste]));

  // pedidos.service.ts lê o localStorage apenas uma vez, no momento em
  // que o módulo é importado (initPedidos() roda no topo do arquivo).
  // Por isso, resetamos os módulos e reimportamos a página DEPOIS de
  // popular o localStorage, garantindo que o cache em memória do
  // serviço reflita os dados deste teste.
  vi.resetModules();
  ({ PedidoAdminPage } = await import("./PedidoAdminPage"));
});

afterEach(() => {
  cleanup();
  localStorage.clear();
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
    render(<PedidoAdminPage />);

    const campoStatus = await screen.findByLabelText(
      "Status do pedido pedido-1",
      {},
      { timeout: 3000 },
    );

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
      // O serviço simula atraso de rede: 500ms (atualizar status) +
      // 300ms (recarregar pedidos) = até 800ms encadeados. Margem
      // generosa para não flackear em ambientes de CI mais lentos.
      { timeout: 5000 },
    );

    const pedidosSalvos = JSON.parse(
      localStorage.getItem("pedidos_loja") ?? "[]",
    ) as Pedido[];

    expect(pedidosSalvos[0].status).toBe("preparando");
  }, 10000);
});
