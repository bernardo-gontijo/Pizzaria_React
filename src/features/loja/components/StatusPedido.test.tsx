import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { StatusPedido } from "./StatusPedido";

const pedido = {
  id: "2",
  status: "confirmado",

  cliente: {
    nome: "Kauan",
  },

  endereco: {
    cep: "69000-000",
    rua: "Rua Teste",
    numero: "123",
    bairro: "Centro",
    cidade: "Manaus",
    estado: "AM",
  },

  total: 50.9,

  statusHistorico: [
    {
      id: "1",
      status: "pendente",
      timestamp: new Date(2026, 8, 10, 17, 30),
      message: "Pedido recebido com sucesso",
    },

    {
      id: "2",
      status: "confirmado",
      timestamp: new Date(2026, 8, 10, 17, 35),
      message: "Pedido confirmado",
    },
  ],
};

describe("StatusPedido", () => {
  it("mostra os dados principais do pedido", () => {
    render(<StatusPedido pedido={pedido} />);

    expect(
      screen.getByText("Pedido #2"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Kauan"),
    ).toBeInTheDocument();

    expect(
      screen.getByText(/R\$ 50\.90/),
    ).toBeInTheDocument();
  });

  it("mostra o histórico de status", () => {
    render(<StatusPedido pedido={pedido} />);

    expect(
      screen.getByRole("heading", {
        name: "Histórico do pedido",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Pedido recebido com sucesso"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Pedido confirmado"),
    ).toBeInTheDocument();
  });

  it("mostra data e hora das mudanças", () => {
    render(<StatusPedido pedido={pedido} />);

    expect(
      screen.getByText(/10\/09\/2026.*17:30/),
    ).toBeInTheDocument();

    expect(
      screen.getByText(/10\/09\/2026.*17:35/),
    ).toBeInTheDocument();
  });

  it("mostra as etapas do fluxo do pedido", () => {
    render(<StatusPedido pedido={pedido} />);

    expect(
      screen.getAllByText("Aguardando").length,
    ).toBeGreaterThan(0);

    expect(
      screen.getAllByText("Confirmado").length,
    ).toBeGreaterThan(0);

    expect(
      screen.getByText("Preparando"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Saiu para entrega"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Entregue"),
    ).toBeInTheDocument();
  });
});