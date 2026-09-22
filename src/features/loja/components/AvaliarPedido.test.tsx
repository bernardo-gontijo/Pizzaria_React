import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { AvaliarPedido } from "./AvaliarPedido";
import {
  buscarAvaliacoesDoPedido,
  criarAvaliacao,
} from "../api/avaliacoes.service";
import type { ItemPedido } from "../types/pedido";

vi.mock("../api/avaliacoes.service", () => ({
  buscarAvaliacoesDoPedido: vi.fn(),
  criarAvaliacao: vi.fn(),
}));

const itemCalabresa: ItemPedido = {
  id: "1",
  tipo: "pizza",
  pizzaId: "pizza-1",
  pizzaName: "Calabresa",
  quantity: 1,
  price: 45.9,
  size: "M",
};

const itemBebida: ItemPedido = {
  id: "2",
  tipo: "bebida",
  pizzaId: "bebida-1",
  pizzaName: "Coca-Cola",
  quantity: 1,
  price: 7.5,
};

describe("AvaliarPedido", () => {
  it("não renderiza nada enquanto ainda está carregando as avaliações do pedido", () => {
    vi.mocked(buscarAvaliacoesDoPedido).mockReturnValue(new Promise(() => {}));

    const { container } = render(
      <AvaliarPedido pedidoId={1} itens={[itemCalabresa]} />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("não renderiza nada quando o pedido só tem bebidas", async () => {
    vi.mocked(buscarAvaliacoesDoPedido).mockResolvedValue([]);

    const { container } = render(
      <AvaliarPedido pedidoId={1} itens={[itemBebida]} />,
    );

    await waitFor(() => {
      expect(buscarAvaliacoesDoPedido).toHaveBeenCalled();
    });

    expect(container).toBeEmptyDOMElement();
  });

  it("mostra o formulário de avaliação para cada pizza ainda não avaliada", async () => {
    vi.mocked(buscarAvaliacoesDoPedido).mockResolvedValue([]);

    render(<AvaliarPedido pedidoId={1} itens={[itemCalabresa]} />);

    await waitFor(() => {
      expect(screen.getByText("Avalie seu pedido")).toBeInTheDocument();
    });

    expect(screen.getByText("Calabresa")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Comentário (opcional)"),
    ).toBeInTheDocument();
  });

  it("mostra agradecimento em vez do formulário para pizza já avaliada", async () => {
    vi.mocked(buscarAvaliacoesDoPedido).mockResolvedValue([
      {
        id: 1,
        pedidoId: 1,
        pizzaId: "pizza-1",
        pizzaNome: "Calabresa",
        nota: 5,
        comentario: null,
        criadoEm: "2026-01-01T00:00:00",
      },
    ]);

    render(<AvaliarPedido pedidoId={1} itens={[itemCalabresa]} />);

    await waitFor(() => {
      expect(
        screen.getByText("Obrigado pela sua avaliação! 🍕"),
      ).toBeInTheDocument();
    });

    expect(
      screen.queryByPlaceholderText("Comentário (opcional)"),
    ).not.toBeInTheDocument();
  });

  it("exige uma nota antes de enviar", async () => {
    vi.mocked(buscarAvaliacoesDoPedido).mockResolvedValue([]);

    render(<AvaliarPedido pedidoId={1} itens={[itemCalabresa]} />);

    await waitFor(() => {
      expect(screen.getByText("Avalie seu pedido")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Enviar avaliação"));

    expect(
      screen.getByText("Escolha de meia a 5 estrelas"),
    ).toBeInTheDocument();
    expect(criarAvaliacao).not.toHaveBeenCalled();
  });

  it("envia a avaliação com a nota escolhida (meia estrela) e o comentário", async () => {
    vi.mocked(buscarAvaliacoesDoPedido).mockResolvedValue([]);
    vi.mocked(criarAvaliacao).mockResolvedValue({
      id: 1,
      pedidoId: 1,
      pizzaId: "pizza-1",
      pizzaNome: "Calabresa",
      nota: 3.5,
      comentario: "Boa pizza",
      criadoEm: "2026-01-01T00:00:00",
    });

    render(<AvaliarPedido pedidoId={1} itens={[itemCalabresa]} />);

    await waitFor(() => {
      expect(screen.getByText("Avalie seu pedido")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByLabelText("3.5 estrelas"));

    fireEvent.change(screen.getByPlaceholderText("Comentário (opcional)"), {
      target: { value: "Boa pizza" },
    });

    fireEvent.click(screen.getByText("Enviar avaliação"));

    await waitFor(() => {
      expect(criarAvaliacao).toHaveBeenCalledWith({
        pedidoId: 1,
        pizzaId: "pizza-1",
        nota: 3.5,
        comentario: "Boa pizza",
      });
    });

    await waitFor(() => {
      expect(
        screen.getByText("Obrigado pela sua avaliação! 🍕"),
      ).toBeInTheDocument();
    });
  });

  it("mostra mensagem de erro quando o envio falha", async () => {
    vi.mocked(buscarAvaliacoesDoPedido).mockResolvedValue([]);
    vi.mocked(criarAvaliacao).mockRejectedValue(
      new Error("você já avaliou esta pizza neste pedido"),
    );

    render(<AvaliarPedido pedidoId={1} itens={[itemCalabresa]} />);

    await waitFor(() => {
      expect(screen.getByText("Avalie seu pedido")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByLabelText("5 estrelas"));
    fireEvent.click(screen.getByText("Enviar avaliação"));

    await waitFor(() => {
      expect(
        screen.getByText("você já avaliou esta pizza neste pedido"),
      ).toBeInTheDocument();
    });
  });

  it("lista cada pizza distinta apenas uma vez, mesmo com múltiplos itens do mesmo tipo", async () => {
    vi.mocked(buscarAvaliacoesDoPedido).mockResolvedValue([]);

    const segundaCalabresa: ItemPedido = {
      ...itemCalabresa,
      id: "3",
      quantity: 2,
    };

    render(
      <AvaliarPedido
        pedidoId={1}
        itens={[itemCalabresa, segundaCalabresa, itemBebida]}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText("Avalie seu pedido")).toBeInTheDocument();
    });

    expect(screen.getAllByText("Calabresa")).toHaveLength(1);
  });
});
