import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MemoryRouter } from "react-router-dom";

import { PizzaCard } from "./PizzaCard";
import type { Pizza } from "../types/pizza";

const pizzaTeste: Pizza = {
  id: "pizza-1",
  nome: "Calabresa",
  descricao: "Calabresa fatiada com cebola",
  preco: 45.9,
  ingredientes: ["calabresa", "cebola", "mussarela"],
  imagem: "/images/pizzas/calabresa.jpg",
  categoria: "tradicional",
  disponivel: true,
};

function renderComRouter(pizza: Pizza) {
  return render(
    <MemoryRouter>
      <PizzaCard pizza={pizza} />
    </MemoryRouter>,
  );
}

describe("PizzaCard", () => {
  it("exibe nome, descrição e categoria da pizza", () => {
    renderComRouter(pizzaTeste);

    expect(
      screen.getByRole("heading", { name: "Calabresa" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Calabresa fatiada com cebola"),
    ).toBeInTheDocument();
    expect(screen.getByText("tradicional")).toBeInTheDocument();
  });

  it("formata o preço no padrão brasileiro (vírgula decimal)", () => {
    renderComRouter(pizzaTeste);

    expect(screen.getByText("R$ 45,90")).toBeInTheDocument();
  });

  it("usa o nome da pizza como texto alternativo da imagem", () => {
    renderComRouter(pizzaTeste);

    expect(screen.getByAltText("Calabresa")).toHaveAttribute(
      "src",
      pizzaTeste.imagem,
    );
  });

  it("linka para a página de detalhes da pizza", () => {
    renderComRouter(pizzaTeste);

    expect(screen.getByRole("link", { name: "Ver detalhes" })).toHaveAttribute(
      "href",
      "/pizza/pizza-1",
    );
  });
});