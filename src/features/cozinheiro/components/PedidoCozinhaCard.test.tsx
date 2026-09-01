// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { Pedido } from "../../loja/types/pedido";
import { PedidoCozinhaCard } from "./PedidoCozinhaCard";

const pedidoBase: Pedido = {
  id: "pedido-001",
  cliente: {
    nome: "Kauan",
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
      id: "item-001",
      pizzaId: "pizza-001",
      pizzaName: "Calabresa",
      quantity: 2,
      price: 35,
      size: "G",
      observations: "Sem cebola",
    },
  ],
  subtotal: 70,
  taxaEntrega: 5,
  desconto: 0,
  total: 75,
  formaPagamento: "pix",
  status: "pendente",
  statusHistorico: [],
  observacoes: "Entregar rápido",
  createdAt: new Date(),
  updatedAt: new Date(),
};

afterEach(() => {
  cleanup();
});

describe("PedidoCozinhaCard", () => {
  it("exibe os dados principais do pedido", () => {
    render(
      <PedidoCozinhaCard
        pedido={pedidoBase}
        onConfirmar={() => undefined}
        onIniciarPreparo={() => undefined}
      />,
    );

    expect(screen.getByText("Pedido pedido-001")).toBeTruthy();
    expect(screen.getByText("Kauan")).toBeTruthy();
    expect(screen.getByText(/2x Calabresa/)).toBeTruthy();
    expect(screen.getByText(/Sem cebola/)).toBeTruthy();
  });

  it("permite confirmar um pedido pendente", () => {
    const onConfirmar = vi.fn();

    render(
      <PedidoCozinhaCard
        pedido={pedidoBase}
        onConfirmar={onConfirmar}
        onIniciarPreparo={() => undefined}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Confirmar pedido" }));

    expect(onConfirmar).toHaveBeenCalledWith("pedido-001");
  });

  it("permite iniciar o preparo de um pedido confirmado", () => {
    const onIniciarPreparo = vi.fn();

    render(
      <PedidoCozinhaCard
        pedido={{
          ...pedidoBase,
          status: "confirmado",
        }}
        onConfirmar={() => undefined}
        onIniciarPreparo={onIniciarPreparo}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Iniciar preparo" }));

    expect(onIniciarPreparo).toHaveBeenCalledWith("pedido-001");
  });
});
