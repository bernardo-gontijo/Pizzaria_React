import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { TenantConfigProvider } from "../../../context/TenantConfigContext";
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

  formaPagamento: "cartao_credito",

  createdAt: new Date(2026, 8, 10, 17, 30),
};

function renderComProvider(ui: React.ReactElement) {
  return render(<TenantConfigProvider>{ui}</TenantConfigProvider>);
}

describe("StatusPedido", () => {
  it("mostra os dados principais do pedido", () => {
    renderComProvider(<StatusPedido pedido={pedido} />);

    expect(screen.getByText("Pedido #2")).toBeInTheDocument();

    expect(screen.getByText("Kauan")).toBeInTheDocument();

    expect(screen.getByText(/R\$\s*50,90/)).toBeInTheDocument();
  });

  it("mostra o endereço e a forma de pagamento", () => {
    renderComProvider(<StatusPedido pedido={pedido} />);

    expect(screen.getByText("Endereço de entrega")).toBeInTheDocument();
    expect(screen.getByText("Cartão de crédito")).toBeInTheDocument();
  });

  it("mostra as etapas do fluxo do pedido", () => {
    renderComProvider(<StatusPedido pedido={pedido} />);

    expect(screen.getAllByText("Aguardando").length).toBeGreaterThan(0);

    expect(screen.getAllByText("Confirmado").length).toBeGreaterThan(0);

    expect(screen.getByText("Preparando")).toBeInTheDocument();

    expect(screen.getByText("Em rota")).toBeInTheDocument();

    expect(screen.getByText("Entregue")).toBeInTheDocument();
  });

  it("não renderiza o histórico de status (responsabilidade do HistoricoPedido)", () => {
    renderComProvider(<StatusPedido pedido={pedido} />);

    expect(
      screen.queryByRole("heading", { name: "Histórico do pedido" }),
    ).not.toBeInTheDocument();
  });
});