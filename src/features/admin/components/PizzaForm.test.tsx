// @vitest-environment jsdom

// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";

import { cleanup, fireEvent, render, screen } from "@testing-library/react";

import { afterEach, describe, expect, it, vi } from "vitest";

import { PizzaForm } from "./PizzaForm";

afterEach(() => {
  cleanup();
});

describe("PizzaForm", () => {
  it("renderiza o formulário de cadastro", () => {
    render(<PizzaForm onSubmit={vi.fn()} />);

    expect(
      screen.getByRole("heading", {
        name: "Cadastrar pizza",
      }),
    ).toBeInTheDocument();

    expect(screen.getByLabelText("Nome")).toBeInTheDocument();

    expect(screen.getByLabelText("Preço")).toBeInTheDocument();
  });

  it("envia os dados da pizza corretamente", () => {
    const onSubmit = vi.fn();

    render(<PizzaForm onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText("Nome"), {
      target: {
        value: "Calabresa",
      },
    });

    fireEvent.change(screen.getByLabelText("Descrição"), {
      target: {
        value: "Pizza de calabresa com queijo",
      },
    });

    fireEvent.change(screen.getByLabelText("Preço"), {
      target: {
        value: "45.90",
      },
    });

    fireEvent.change(screen.getByLabelText("Ingredientes"), {
      target: {
        value: "calabresa, queijo, cebola",
      },
    });

    fireEvent.change(screen.getByLabelText("Categoria"), {
      target: {
        value: "tradicional",
      },
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: "Cadastrar pizza",
      }),
    );

    expect(onSubmit).toHaveBeenCalledOnce();

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        nome: "Calabresa",
        descricao: "Pizza de calabresa com queijo",
        preco: 45.9,
        ingredientes: ["calabresa", "queijo", "cebola"],
        categoria: "tradicional",
        disponivel: true,
      }),
    );
  });
});
