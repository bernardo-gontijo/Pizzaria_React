import { afterEach, describe, expect, it, vi } from "vitest";
import { buscarEnderecoPorCEP } from "./cep.service";

afterEach(() => vi.unstubAllGlobals());

describe("consulta de CEP", () => {
  it("normaliza o CEP e converte os campos do ViaCEP", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        logradouro: "Praça da Sé",
        bairro: "Sé",
        localidade: "São Paulo",
        uf: "SP",
      }),
    });
    vi.stubGlobal("fetch", fetchMock);
    expect(await buscarEnderecoPorCEP("01001-000")).toEqual({
      rua: "Praça da Sé",
      bairro: "Sé",
      cidade: "São Paulo",
      estado: "SP",
    });
    expect(fetchMock).toHaveBeenCalledWith(
      "https://viacep.com.br/ws/01001000/json/",
      { signal: undefined },
    );
  });

  it("rejeita CEP incompleto sem consultar a API", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    await expect(buscarEnderecoPorCEP("123")).rejects.toThrow("8 dígitos");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("trata CEP inexistente", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue({ ok: true, json: async () => ({ erro: true }) }),
    );
    await expect(buscarEnderecoPorCEP("99999999")).rejects.toThrow(
      "CEP não encontrado",
    );
  });

  it("trata erro HTTP", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false }));
    await expect(buscarEnderecoPorCEP("01001000")).rejects.toThrow(
      "Não foi possível consultar",
    );
  });
});
