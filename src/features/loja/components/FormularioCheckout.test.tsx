import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { buscarEnderecoPorCEP } from "../api/cep.service";
import { FormularioCheckout } from "./FormularioCheckout";

vi.mock("../api/cep.service", () => ({ buscarEnderecoPorCEP: vi.fn() }));

const endereco = {
  rua: "Rua Teste",
  bairro: "Centro",
  cidade: "Manaus",
  estado: "AM",
};

beforeEach(() => vi.resetAllMocks());

function preencher(nome: RegExp, valor: string) {
  fireEvent.change(screen.getByLabelText(nome), { target: { value: valor } });
}

describe("endereço no checkout", () => {
  it("consulta ao sair do CEP e envia o endereço completo editado", async () => {
    vi.mocked(buscarEnderecoPorCEP).mockResolvedValue(endereco);
    const enviar = vi.fn();
    render(<FormularioCheckout onSubmit={enviar} />);
    preencher(/^CEP/, "69000000");
    expect(buscarEnderecoPorCEP).not.toHaveBeenCalled();
    fireEvent.blur(screen.getByLabelText(/^CEP/));
    await waitFor(() =>
      expect(screen.getByLabelText(/^Rua/)).toHaveValue("Rua Teste"),
    );
    preencher(/^Nome/, "Cliente Teste");
    preencher(/^Telefone/, "92999999999");
    preencher(/^Número/, "25");
    preencher(/^Complemento/, "Casa B");
    preencher(/^Ponto/, "Portão azul");
    preencher(/^Rua/, "Rua Corrigida");
    fireEvent.click(screen.getByRole("button", { name: "Finalizar Pedido" }));
    expect(enviar).toHaveBeenCalledWith({
      nome: "Cliente Teste",
      telefone: "92999999999",
      formaPagamento: "pix",
      endereco: {
        ...endereco,
        cep: "69000000",
        rua: "Rua Corrigida",
        numero: "25",
        complemento: "Casa B",
        referencia: "Portão azul",
      },
    });
  });

  it("permite preenchimento manual quando a consulta falha", async () => {
    vi.mocked(buscarEnderecoPorCEP).mockRejectedValue(new Error("Sem conexão"));
    render(<FormularioCheckout onSubmit={vi.fn()} />);
    preencher(/^CEP/, "69000000");
    fireEvent.blur(screen.getByLabelText(/^CEP/));
    await screen.findByText(/Preencha o endereço manualmente/);
    expect(screen.getByLabelText(/^Rua/)).toBeEnabled();
    preencher(/^Rua/, "Rua Manual");
    expect(screen.getByLabelText(/^Rua/)).toHaveValue("Rua Manual");
  });

  it("ignora resposta antiga quando o cliente troca o CEP", async () => {
    let resolverAntigo!: (valor: typeof endereco) => void;
    vi.mocked(buscarEnderecoPorCEP)
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolverAntigo = resolve;
          }),
      )
      .mockResolvedValueOnce({ ...endereco, rua: "Rua Nova" });
    render(<FormularioCheckout onSubmit={vi.fn()} />);
    preencher(/^CEP/, "01001000");
    fireEvent.blur(screen.getByLabelText(/^CEP/));
    const sinalAntigo = vi.mocked(buscarEnderecoPorCEP).mock.calls[0][1];
    preencher(/^CEP/, "69000000");
    expect(sinalAntigo?.aborted).toBe(true);
    fireEvent.blur(screen.getByLabelText(/^CEP/));
    await waitFor(() =>
      expect(screen.getByLabelText(/^Rua/)).toHaveValue("Rua Nova"),
    );
    await act(async () => resolverAntigo(endereco));
    expect(screen.getByLabelText(/^Rua/)).toHaveValue("Rua Nova");
  });
});
