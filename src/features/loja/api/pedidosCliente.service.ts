import { getClienteToken, logoutCliente } from "./clienteAuth.service";

import type {
  AtualizarStatusPedidoDTO,
  CriarPedidoDTO,
  Pedido,
} from "../types/pedido";

const API_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:5000";

interface PedidoApi extends Omit<
  Pedido,
  "createdAt" | "updatedAt" | "statusHistorico"
> {
  createdAt: string;
  updatedAt: string;

  statusHistorico: Array<
    Omit<Pedido["statusHistorico"][number], "timestamp"> & {
      timestamp: string;
    }
  >;
}

function normalizarPedido(pedido: PedidoApi): Pedido {
  return {
    ...pedido,

    createdAt: new Date(pedido.createdAt),

    updatedAt: new Date(pedido.updatedAt),

    statusHistorico: pedido.statusHistorico.map((historico) => ({
      ...historico,

      timestamp: new Date(historico.timestamp),
    })),
  };
}

function getHeaders(): HeadersInit {
  const token = getClienteToken();

  if (!token) {
    throw new Error("Você precisa entrar na sua conta.");
  }

  return {
    "Content-Type": "application/json",

    Authorization: `Bearer ${token}`,
  };
}

function verificarSessao(resposta: Response): void {
  if (resposta.status === 401 || resposta.status === 422) {
    logoutCliente();

    window.location.href = "/login";

    throw new Error("Sua sessão expirou. Entre novamente.");
  }
}

async function obterErro(resposta: Response): Promise<string> {
  try {
    const dados = (await resposta.json()) as {
      erro?: string;
      msg?: string;
    };

    return dados.erro ?? dados.msg ?? "Erro ao acessar o servidor";
  } catch {
    return "Erro ao acessar o servidor";
  }
}

export async function criarPedidoCliente(
  dados: CriarPedidoDTO,
): Promise<Pedido> {
  const resposta = await fetch(`${API_URL}/pedidos`, {
    method: "POST",

    headers: getHeaders(),

    body: JSON.stringify({
      tipo: dados.mesaId ? "local" : "delivery",

      cliente: dados.cliente,

      endereco: dados.endereco,

      itens: dados.itens,

      formaPagamento: dados.formaPagamento,

      trocoPara: dados.trocoPara,

      observacoes: dados.observacoes,

      mesaId: dados.mesaId,

      taxaEntrega: dados.mesaId ? 0 : 5,

      /*
       * O frontend envia somente
       * o código do cupom.
       *
       * O backend valida novamente
       * e calcula o desconto real.
       */
      cupomCodigo: dados.cupomCodigo,
    }),
  });

  verificarSessao(resposta);

  if (!resposta.ok) {
    throw new Error(await obterErro(resposta));
  }

  return normalizarPedido((await resposta.json()) as PedidoApi);
}

export async function buscarPedidosCliente(): Promise<Pedido[]> {
  const resposta = await fetch(`${API_URL}/pedidos`, {
    method: "GET",

    headers: getHeaders(),
  });

  verificarSessao(resposta);

  if (!resposta.ok) {
    throw new Error(await obterErro(resposta));
  }

  const pedidos = (await resposta.json()) as PedidoApi[];

  return pedidos.map(normalizarPedido);
}

export async function buscarPedidoClientePorId(
  id: string,
): Promise<Pedido | null> {
  const resposta = await fetch(`${API_URL}/pedidos/${id}`, {
    method: "GET",

    headers: getHeaders(),
  });

  verificarSessao(resposta);

  if (resposta.status === 404) {
    return null;
  }

  if (!resposta.ok) {
    throw new Error(await obterErro(resposta));
  }

  return normalizarPedido((await resposta.json()) as PedidoApi);
}

export async function atualizarStatusPedidoCliente(
  id: string,
  dados: AtualizarStatusPedidoDTO,
): Promise<Pedido> {
  const resposta = await fetch(`${API_URL}/pedidos/${id}/status`, {
    method: "PATCH",

    headers: getHeaders(),

    body: JSON.stringify({
      status: dados.status,
    }),
  });

  verificarSessao(resposta);

  if (!resposta.ok) {
    throw new Error(await obterErro(resposta));
  }

  return normalizarPedido((await resposta.json()) as PedidoApi);
}
