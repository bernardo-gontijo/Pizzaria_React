import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { EstrelaMedia } from "./EstrelaMedia";

describe("EstrelaMedia", () => {
  it("mostra 'Sem avaliações' quando não há nenhuma avaliação", () => {
    render(<EstrelaMedia media={null} total={0} />);

    expect(screen.getByText("Sem avaliações")).toBeInTheDocument();
  });

  it("não renderiza nada quando compacto e sem avaliação", () => {
    const { container } = render(
      <EstrelaMedia media={null} total={0} compacto />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("mostra o número da média formatado com uma casa decimal", () => {
    render(<EstrelaMedia media={4} total={10} />);

    expect(screen.getByText("4.0")).toBeInTheDocument();
    expect(screen.getByText("(10)")).toBeInTheDocument();
  });

  it("arredonda a média para o incremento de meia estrela mais próximo", () => {
    // 3.7 deve arredondar para 3.5 (mais próximo que 4.0)
    render(<EstrelaMedia media={3.7} total={5} />);

    expect(screen.getByText("3.7")).toBeInTheDocument();
  });

  it("exibe o total entre parênteses", () => {
    render(<EstrelaMedia media={5} total={1} />);

    expect(screen.getByText("(1)")).toBeInTheDocument();
  });
});
