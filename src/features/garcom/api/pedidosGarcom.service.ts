import { getGarcomToken, logout } from "./auth.service";

import type { ItemPedido, Pedido } from "../../loja/types/pedido";

const API_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:5000";

type HistoricoItem = Pedido["statusHistorico"][number];

interface PedidoApi
  extends Omit<Pedido, "createdAt" | "updatedAt" | "statusHistorico"> {
  createdAt: string;
  updatedAt: string;
  statusHistorico: (Omit<HistoricoItem, "timestamp"> & {
    timestamp: string;
  })[];
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
  const token = getGarcomToken();

  if (!token) {
    throw new Error("Você precisa entrar na sua conta de garçom.");
  }

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

function verificarSessao(resposta: Response): void {
  if (resposta.status === 401 || resposta.status === 422) {
    logout();
    window.location.href = "/garcom/login";
    throw new Error("Sua sessão expirou. Entre novamente.");
  }
}

async function obterErro(resposta: Response): Promise<string> {
  try {
    const dados = (await resposta.json()) as { erro?: string; msg?: string };
    return dados.erro ?? dados.msg ?? "Erro ao acessar o servidor";
  } catch {
    return "Erro ao acessar o servidor";
  }
}

interface CriarPedidoMesaDTO {
  cliente: { nome: string; telefone?: string };
  itens: Omit<ItemPedido, "id">[];
  formaPagamento?: string;
  mesaId: string;
}

export async function criarPedido(dados: CriarPedidoMesaDTO): Promise<Pedido> {
  const resposta = await fetch(`${API_URL}/pedidos`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({
      tipo: "local",
      cliente: dados.cliente,
      itens: dados.itens,
      formaPagamento: dados.formaPagamento,
      mesaId: dados.mesaId,
      taxaEntrega: 0,
      desconto: 0,
    }),
  });

  verificarSessao(resposta);

  if (!resposta.ok) {
    throw new Error(await obterErro(resposta));
  }

  return normalizarPedido((await resposta.json()) as PedidoApi);
}

export async function buscarPedidoPorId(id: string): Promise<Pedido | null> {
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

export async function atualizarItensPedido(
  id: string,
  itens: Omit<ItemPedido, "id">[],
): Promise<Pedido> {
  const resposta = await fetch(`${API_URL}/pedidos/${id}/itens`, {
    method: "PATCH",
    headers: getHeaders(),
    body: JSON.stringify({ itens }),
  });

  verificarSessao(resposta);

  if (!resposta.ok) {
    throw new Error(await obterErro(resposta));
  }

  return normalizarPedido((await resposta.json()) as PedidoApi);
}

export async function atualizarStatusPedido(
  id: string,
  status: string,
): Promise<Pedido> {
  const resposta = await fetch(`${API_URL}/pedidos/${id}/status`, {
    method: "PATCH",
    headers: getHeaders(),
    body: JSON.stringify({ status }),
  });

  verificarSessao(resposta);

  if (!resposta.ok) {
    throw new Error(await obterErro(resposta));
  }

  return normalizarPedido((await resposta.json()) as PedidoApi);
}
