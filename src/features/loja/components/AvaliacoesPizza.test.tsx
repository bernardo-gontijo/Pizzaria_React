import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { AvaliacoesPizza } from "./AvaliacoesPizza";
import { buscarAvaliacoesDaPizza } from "../api/avaliacoes.service";

vi.mock("../api/avaliacoes.service", () => ({
  buscarAvaliacoesDaPizza: vi.fn(),
}));

describe("AvaliacoesPizza", () => {
  it("não renderiza nada enquanto os dados ainda não chegaram", () => {
    vi.mocked(buscarAvaliacoesDaPizza).mockReturnValue(new Promise(() => {}));

    const { container } = render(<AvaliacoesPizza pizzaId="pizza-1" />);

    expect(container).toBeEmptyDOMElement();
  });

  it("mostra a média e a lista de comentários após carregar", async () => {
    vi.mocked(buscarAvaliacoesDaPizza).mockResolvedValue({
      pizzaId: "pizza-1",
      media: 4.5,
      total: 2,
      avaliacoes: [
        {
          id: 1,
          pedidoId: 10,
          pizzaId: "pizza-1",
          pizzaNome: "Calabresa",
          nota: 5,
          comentario: "Muito boa!",
          criadoEm: "2026-01-01T00:00:00",
          clienteNome: "Maria",
        },
        {
          id: 2,
          pedidoId: 11,
          pizzaId: "pizza-1",
          pizzaNome: "Calabresa",
          nota: 4,
          comentario: null,
          criadoEm: "2026-01-02T00:00:00",
        },
      ],
    });

    render(<AvaliacoesPizza pizzaId="pizza-1" />);

    await waitFor(() => {
      expect(screen.getByText("Avaliações")).toBeInTheDocument();
    });

    expect(screen.getByText("4.5")).toBeInTheDocument();
    expect(screen.getByText("(2)")).toBeInTheDocument();
    expect(screen.getByText("Muito boa!")).toBeInTheDocument();
    expect(screen.getByText("Maria")).toBeInTheDocument();
  });

  it("busca de novo quando a pizzaId muda", async () => {
    vi.mocked(buscarAvaliacoesDaPizza).mockResolvedValue({
      pizzaId: "pizza-1",
      media: null,
      total: 0,
      avaliacoes: [],
    });

    const { rerender } = render(<AvaliacoesPizza pizzaId="pizza-1" />);

    await waitFor(() => {
      expect(buscarAvaliacoesDaPizza).toHaveBeenCalledWith("pizza-1");
    });

    rerender(<AvaliacoesPizza pizzaId="pizza-2" />);

    await waitFor(() => {
      expect(buscarAvaliacoesDaPizza).toHaveBeenCalledWith("pizza-2");
    });
  });

  it("não exibe comentário quando ele é nulo", async () => {
    vi.mocked(buscarAvaliacoesDaPizza).mockResolvedValue({
      pizzaId: "pizza-1",
      media: 3,
      total: 1,
      avaliacoes: [
        {
          id: 1,
          pedidoId: 10,
          pizzaId: "pizza-1",
          pizzaNome: "Calabresa",
          nota: 3,
          comentario: null,
          criadoEm: "2026-01-01T00:00:00",
        },
      ],
    });

    render(<AvaliacoesPizza pizzaId="pizza-1" />);

    await waitFor(() => {
      expect(screen.getByText("3.0")).toBeInTheDocument();
    });

    expect(screen.queryByRole("paragraph")).not.toBeInTheDocument();
  });
});
