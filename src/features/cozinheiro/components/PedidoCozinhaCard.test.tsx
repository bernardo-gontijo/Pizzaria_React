import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { Pedido } from "../../loja/types/pedido";
import { PedidoCozinhaCard } from "./PedidoCozinhaCard";

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
      quantity: 2,
      price: 40,
      size: "M",
    },
  ],
  subtotal: 80,
  taxaEntrega: 0,
  desconto: 0,
  total: 80,
  formaPagamento: "dinheiro",
  status: "pendente",
  statusHistorico: [],
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("PedidoCozinhaCard", () => {
  it("exibe os dados principais do pedido", () => {
    render(
      <PedidoCozinhaCard
        pedido={pedidoBase}
        onConfirmar={vi.fn()}
        onIniciarPreparo={vi.fn()}
        onFinalizarPreparo={vi.fn()}
      />,
    );

    expect(screen.getByText("Pedido pedido-1")).toBeInTheDocument();
    expect(screen.getByText("Cliente Teste")).toBeInTheDocument();
    expect(screen.getByText(/2x Calabresa/)).toBeInTheDocument();
    expect(screen.getByText("Pedido delivery")).toBeInTheDocument();
  });

  it("permite confirmar um pedido pendente", () => {
    const onConfirmar = vi.fn();

    render(
      <PedidoCozinhaCard
        pedido={pedidoBase}
        onConfirmar={onConfirmar}
        onIniciarPreparo={vi.fn()}
        onFinalizarPreparo={vi.fn()}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Confirmar pedido",
      }),
    );

    expect(onConfirmar).toHaveBeenCalledWith("pedido-1");
  });

  it("permite iniciar o preparo de um pedido confirmado", () => {
    const onIniciarPreparo = vi.fn();

    const pedidoConfirmado: Pedido = {
      ...pedidoBase,
      status: "confirmado",
    };

    render(
      <PedidoCozinhaCard
        pedido={pedidoConfirmado}
        onConfirmar={vi.fn()}
        onIniciarPreparo={onIniciarPreparo}
        onFinalizarPreparo={vi.fn()}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Iniciar preparo",
      }),
    );

    expect(onIniciarPreparo).toHaveBeenCalledWith("pedido-1");
  });

  it("mostra a opção de pronto para pedido local em preparo", () => {
    const onFinalizarPreparo = vi.fn();

    const pedidoLocal: Pedido = {
      ...pedidoBase,
      status: "preparando",
      mesaId: "mesa-1",
      cliente: {
        nome: "Mesa 1",
        telefone: "",
      },
    };

    render(
      <PedidoCozinhaCard
        pedido={pedidoLocal}
        onConfirmar={vi.fn()}
        onIniciarPreparo={vi.fn()}
        onFinalizarPreparo={onFinalizarPreparo}
      />,
    );

    expect(screen.getByText("Pedido local")).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Marcar como pronto",
      }),
    );

    expect(onFinalizarPreparo).toHaveBeenCalledWith("pedido-1");
  });

  it("mostra a opção de preparado para pedido delivery", () => {
    const onFinalizarPreparo = vi.fn();

    const pedidoDelivery: Pedido = {
      ...pedidoBase,
      status: "preparando",
    };

    render(
      <PedidoCozinhaCard
        pedido={pedidoDelivery}
        onConfirmar={vi.fn()}
        onIniciarPreparo={vi.fn()}
        onFinalizarPreparo={onFinalizarPreparo}
      />,
    );

    expect(screen.getByText("Pedido delivery")).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Preparado para delivery",
      }),
    );

    expect(onFinalizarPreparo).toHaveBeenCalledWith("pedido-1");
  });
});
