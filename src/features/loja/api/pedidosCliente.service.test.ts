import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import {
  buscarPedidoClientePorId,
  buscarPedidosCliente,
} from "./pedidosCliente.service";

import { getClienteToken } from "./clienteAuth.service";

vi.mock("./clienteAuth.service", () => ({
  getClienteToken: vi.fn(),
  logoutCliente: vi.fn(),
}));

const mockGetClienteToken = vi.mocked(getClienteToken);

const pedidoApi = {
  id: "1",

  cliente: {
    nome: "Kauan",
    email: "kauan@teste.com",
    telefone: "92999999999",
  },

  itens: [
    {
      id: "1",
      pizzaId: "pizza-1",
      pizzaName: "Calabresa",
      quantity: 1,
      price: 45.9,
      size: "M" as const,
    },
  ],

  subtotal: 45.9,
  taxaEntrega: 5,
  desconto: 0,
  total: 50.9,

  formaPagamento: "pix" as const,

  status: "confirmado" as const,

  statusHistorico: [
    {
      id: "1",
      status: "pendente" as const,
      timestamp: "2026-09-10T17:30:00",
      message: "Pedido recebido com sucesso",
    },
    {
      id: "2",
      status: "confirmado" as const,
      timestamp: "2026-09-10T17:35:00",
      message: "Pedido confirmado",
    },
  ],

  createdAt: "2026-09-10T17:30:00",
  updatedAt: "2026-09-10T17:35:00",
};

beforeEach(() => {
  mockGetClienteToken.mockReturnValue("jwt-teste");
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("pedidosCliente.service", () => {
  it("envia o token JWT ao buscar pedidos", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => [pedidoApi],
      } as Response);

    await buscarPedidosCliente();

    expect(fetchMock).toHaveBeenCalledWith(
      "http://127.0.0.1:5000/pedidos",
      expect.objectContaining({
        method: "GET",
        headers: expect.objectContaining({
          Authorization: "Bearer jwt-teste",
        }),
      }),
    );
  });

  it("converte datas recebidas da API para Date", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => [pedidoApi],
    } as Response);

    const pedidos = await buscarPedidosCliente();

    expect(pedidos).toHaveLength(1);

    expect(pedidos[0].createdAt).toBeInstanceOf(Date);
    expect(pedidos[0].updatedAt).toBeInstanceOf(Date);

    expect(
      pedidos[0].statusHistorico[0].timestamp,
    ).toBeInstanceOf(Date);
  });

  it("retorna null quando o pedido não existe", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => ({
        erro: "pedido não encontrado",
      }),
    } as Response);

    const pedido =
      await buscarPedidoClientePorId("999");

    expect(pedido).toBeNull();
  });

  it("exige autenticação para acessar pedidos", async () => {
    mockGetClienteToken.mockReturnValue(null);

    await expect(
      buscarPedidosCliente(),
    ).rejects.toThrow(
      "Você precisa entrar na sua conta.",
    );
  });
});