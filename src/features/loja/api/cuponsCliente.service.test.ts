import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  listarCuponsDisponiveis,
  validarCupomCliente,
} from "./cuponsCliente.service";

import { getClienteToken, logoutCliente } from "./clienteAuth.service";

vi.mock("./clienteAuth.service", () => ({
  getClienteToken: vi.fn(),
  logoutCliente: vi.fn(),
}));

function respostaJson(dados: unknown, status = 200): Response {
  return new Response(JSON.stringify(dados), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

describe("cuponsCliente.service", () => {
  beforeEach(() => {
    vi.mocked(getClienteToken).mockReturnValue("token-teste");
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.clearAllMocks();
  });

  it("valida um cupom disponível", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      respostaJson({
        valido: true,
        codigo: "FISICO10",
        tipoDesconto: "percentual",
        valor: 10,
        subtotal: 80,
        descontoCalculado: 8,
        totalComDesconto: 72,
      }),
    );

    const resultado = await validarCupomCliente("FISICO10", 80);

    expect(resultado).toEqual({
      valido: true,
      codigo: "FISICO10",
      tipoDesconto: "percentual",
      valor: 10,
      subtotal: 80,
      descontoCalculado: 8,
      totalComDesconto: 72,
    });

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/cupons/validar"),
      expect.objectContaining({
        method: "POST",
      }),
    );

    const configuracao = fetchMock.mock.calls[0][1];

    expect(configuracao?.headers).toEqual(
      expect.objectContaining({
        Authorization: "Bearer token-teste",
      }),
    );

    expect(JSON.parse(String(configuracao?.body))).toEqual({
      codigo: "FISICO10",
      subtotal: 80,
    });
  });

  it("retorna cupom inválido quando a API responde 404", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      respostaJson(
        {
          valido: false,
          erro: "Cupom não encontrado",
        },
        404,
      ),
    );

    const resultado = await validarCupomCliente("NAOEXISTE", 100);

    expect(resultado).toEqual({
      valido: false,
      codigo: undefined,
      erro: "Cupom não encontrado",
    });
  });

  it("lança erro quando não existe token do cliente", async () => {
    vi.mocked(getClienteToken).mockReturnValue(null);

    const fetchMock = vi.spyOn(globalThis, "fetch");

    await expect(validarCupomCliente("FISICO10", 100)).rejects.toThrow(
      "Você precisa entrar na sua conta.",
    );

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("lança o erro retornado pela API", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      respostaJson(
        {
          erro: "Erro de teste",
        },
        400,
      ),
    );

    await expect(validarCupomCliente("ERRO", 100)).rejects.toThrow(
      "Erro de teste",
    );
  });

  it("lista cupons disponíveis e quase disponíveis", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      respostaJson({
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

        quaseDisponiveis: [
          {
            codigo: "MENOS20",
            tipoDesconto: "fixo",
            valor: 20,
            pedidoMinimo: 100,
            faltanteParaUsar: 20,
          },
        ],
      }),
    );

    const resultado = await listarCuponsDisponiveis(80);

    expect(resultado.disponiveis).toHaveLength(1);

    expect(resultado.disponiveis[0].codigo).toBe("FISICO10");

    expect(resultado.quaseDisponiveis[0].faltanteParaUsar).toBe(20);

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/cupons/disponiveis?subtotal=80"),
      expect.objectContaining({
        method: "GET",
      }),
    );
  });

  it("não consulta cupons com subtotal inválido", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch");

    await expect(listarCuponsDisponiveis(-10)).rejects.toThrow(
      "Subtotal inválido",
    );

    expect(fetchMock).not.toHaveBeenCalled();

    expect(logoutCliente).not.toHaveBeenCalled();
  });
});
