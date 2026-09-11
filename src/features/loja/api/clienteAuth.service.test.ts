import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import {
  getClienteSessao,
  getClienteToken,
  loginCliente,
  logoutCliente,
} from "./clienteAuth.service";

const usuario = {
  id: 1,
  nome: "Kauan",
  email: "kauan@teste.com",
  role: "cliente",
};

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

describe("clienteAuth.service", () => {
  it("faz login e salva token e usuário", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({
        token: "token-teste",
        usuario,
      }),
    } as Response);

    const sessao = await loginCliente(
      "kauan@teste.com",
      "123456",
    );

    expect(sessao.token).toBe("token-teste");
    expect(sessao.usuario).toEqual(usuario);

    expect(getClienteToken()).toBe("token-teste");
    expect(getClienteSessao()?.usuario).toEqual(usuario);
  });

  it("envia email e senha para o endpoint de login", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue({
        ok: true,
        json: async () => ({
          token: "token-teste",
          usuario,
        }),
      } as Response);

    await loginCliente(
      "kauan@teste.com",
      "123456",
    );

    expect(fetchMock).toHaveBeenCalledWith(
      "http://127.0.0.1:5000/login",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          email: "kauan@teste.com",
          senha: "123456",
        }),
      }),
    );
  });

  it("remove a sessão no logout", () => {
    localStorage.setItem(
      "pizzashop:cliente-auth",
      JSON.stringify({
        token: "token-teste",
        usuario,
      }),
    );

    logoutCliente();

    expect(getClienteSessao()).toBeNull();
    expect(getClienteToken()).toBeNull();
  });

  it("lança erro quando o login é recusado", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: false,
      json: async () => ({
        erro: "email ou senha inválidos",
      }),
    } as Response);

    await expect(
      loginCliente(
        "errado@teste.com",
        "senha-errada",
      ),
    ).rejects.toThrow("email ou senha inválidos");
  });
});