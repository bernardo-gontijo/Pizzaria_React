import { getAdminToken, logout } from "./auth.service";

import type {
  AtualizarStatusPedidoDTO,
  Pedido,
} from "../../loja/types/pedido";

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
  const token = getAdminToken();

  if (!token) {
    throw new Error("Você precisa entrar na sua conta de administrador.");
  }

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

function verificarSessao(resposta: Response): void {
  if (resposta.status === 401 || resposta.status === 422) {
    logout();
    window.location.href = "/admin/login";
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

export async function buscarPedidos(): Promise<Pedido[]> {
  const resposta = await fetch(`${API_URL}/pedidos/admin`, {
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

export async function atualizarStatusPedido(
  id: string,
  dados: AtualizarStatusPedidoDTO,
): Promise<Pedido> {
  const resposta = await fetch(`${API_URL}/pedidos/${id}/status`, {
    method: "PATCH",
    headers: getHeaders(),
    body: JSON.stringify({ status: dados.status }),
  });

  verificarSessao(resposta);

  if (!resposta.ok) {
    throw new Error(await obterErro(resposta));
  }

  return normalizarPedido((await resposta.json()) as PedidoApi);
}
