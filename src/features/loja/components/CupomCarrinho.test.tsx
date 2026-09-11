import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { beforeEach, describe, expect, it, vi } from "vitest";

import { CupomCarrinho } from "./CupomCarrinho";

import {
  listarCuponsDisponiveis,
  validarCupomCliente,
} from "../api/cuponsCliente.service";

import { useCart } from "../../../context/CartContext";

vi.mock("../api/cuponsCliente.service", () => ({
  listarCuponsDisponiveis: vi.fn(),

  validarCupomCliente: vi.fn(),
}));

vi.mock("../../../context/CartContext", () => ({
  useCart: vi.fn(),
}));

const adicionarItem = vi.fn();

const removerItem = vi.fn();

const alterarQuantidade = vi.fn();

const limparCarrinho = vi.fn();

const aplicarCupom = vi.fn();

const removerCupom = vi.fn();

function configurarCarrinho(
  cupomAplicado: {
    codigo: string;
    tipoDesconto: "percentual" | "fixo";
    valor: number;
    desconto: number;
  } | null = null,
) {
  const desconto = cupomAplicado?.desconto ?? 0;

  vi.mocked(useCart).mockReturnValue({
    items: [],

    adicionarItem,
    removerItem,
    alterarQuantidade,
    limparCarrinho,

    subtotal: 80,
    taxaEntrega: 5,

    cupomAplicado,
    aplicarCupom,
    removerCupom,

    desconto,

    total: 80 + 5 - desconto,
  });
}

describe("CupomCarrinho", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    configurarCarrinho();

    vi.mocked(listarCuponsDisponiveis).mockResolvedValue({
      subtotal: 80,

      disponiveis: [],

      quaseDisponiveis: [],
    });
  });

  it("carrega e mostra os cupons disponíveis", async () => {
    vi.mocked(listarCuponsDisponiveis).mockResolvedValue({
      subtotal: 80,

      disponiveis: [
        {
          codigo: "FISICO10",
          tipoDesconto: "percentual",
          valor: 10,
          pedidoMinimo: 50,
          descontoCalculado: 8,
        },
      ],

      quaseDisponiveis: [],
    });

    render(<CupomCarrinho />);

    expect(await screen.findByText("FISICO10")).toBeInTheDocument();

    expect(screen.getByText("10% de desconto")).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: "Usar cupom",
      }),
    ).toBeInTheDocument();

    expect(listarCuponsDisponiveis).toHaveBeenCalledWith(80);
  });

  it("mostra quanto falta para liberar um cupom", async () => {
    vi.mocked(listarCuponsDisponiveis).mockResolvedValue({
      subtotal: 80,

      disponiveis: [],

      quaseDisponiveis: [
        {
          codigo: "MENOS20",
          tipoDesconto: "fixo",
          valor: 20,
          pedidoMinimo: 100,
          faltanteParaUsar: 20,
        },
      ],
    });

    render(<CupomCarrinho />);

    expect(await screen.findByText("MENOS20")).toBeInTheDocument();

    expect(screen.getByText(/Você está quase lá/i)).toBeInTheDocument();

    expect(screen.getByText(/Faltam/i)).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: "Indisponível",
      }),
    ).toBeDisabled();
  });

  it("aplica um cupom ao clicar em Usar cupom", async () => {
    vi.mocked(listarCuponsDisponiveis).mockResolvedValue({
      subtotal: 80,

      disponiveis: [
        {
          codigo: "FISICO10",
          tipoDesconto: "percentual",
          valor: 10,
          pedidoMinimo: 50,
          descontoCalculado: 8,
        },
      ],

      quaseDisponiveis: [],
    });

    vi.mocked(validarCupomCliente).mockResolvedValue({
      valido: true,
      codigo: "FISICO10",
      tipoDesconto: "percentual",
      valor: 10,
      subtotal: 80,
      descontoCalculado: 8,
      totalComDesconto: 72,
    });

    render(<CupomCarrinho />);

    const botao = await screen.findByRole("button", {
      name: "Usar cupom",
    });

    fireEvent.click(botao);

    await waitFor(() => {
      expect(validarCupomCliente).toHaveBeenCalledWith("FISICO10", 80);
    });

    expect(aplicarCupom).toHaveBeenCalledWith({
      codigo: "FISICO10",
      tipoDesconto: "percentual",
      valor: 10,
      desconto: 8,
    });
  });

  it("permite digitar manualmente e aplica o código em maiúsculo", async () => {
    vi.mocked(validarCupomCliente).mockResolvedValue({
      valido: true,
      codigo: "PIZZA10",
      tipoDesconto: "percentual",
      valor: 10,
      subtotal: 80,
      descontoCalculado: 8,
      totalComDesconto: 72,
    });

    render(<CupomCarrinho />);

    const input = screen.getByLabelText("Código do cupom");

    fireEvent.change(input, {
      target: {
        value: "pizza10",
      },
    });

    expect(input).toHaveValue("PIZZA10");

    fireEvent.click(
      screen.getByRole("button", {
        name: "Aplicar",
      }),
    );

    await waitFor(() => {
      expect(validarCupomCliente).toHaveBeenCalledWith("PIZZA10", 80);
    });

    expect(aplicarCupom).toHaveBeenCalled();
  });

  it("mostra erro quando o cupom é inválido", async () => {
    vi.mocked(validarCupomCliente).mockResolvedValue({
      valido: false,
      codigo: "RUIM",
      erro: "Cupom expirado",
    });

    render(<CupomCarrinho />);

    fireEvent.change(screen.getByLabelText("Código do cupom"), {
      target: {
        value: "RUIM",
      },
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: "Aplicar",
      }),
    );

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Cupom expirado",
    );

    expect(aplicarCupom).not.toHaveBeenCalled();
  });

  it("mostra o cupom aplicado e permite removê-lo", () => {
    configurarCarrinho({
      codigo: "FISICO10",
      tipoDesconto: "percentual",
      valor: 10,
      desconto: 8,
    });

    render(<CupomCarrinho />);

    expect(screen.getByText("Cupom aplicado")).toBeInTheDocument();

    expect(screen.getByText("FISICO10")).toBeInTheDocument();

    expect(screen.getByText(/R\$.*8,00/)).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Remover",
      }),
    );

    expect(removerCupom).toHaveBeenCalledTimes(1);
  });
});
