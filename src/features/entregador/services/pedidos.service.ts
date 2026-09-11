import { getEntregadorToken, entregadorAuthService } from "./entregadorAuth.service";

import type {
  Pedido,
  StatusPedidoType,
} from "../../loja/types/pedido";

const API_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:5000";

export const PEDIDOS_ATUALIZADOS_EVENT = "pizzashop:pedidos-atualizados";

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
  const token = getEntregadorToken();

  if (!token) {
    throw new Error("Você precisa entrar na sua conta de entregador.");
  }

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

function verificarSessao(resposta: Response): void {
  if (resposta.status === 401 || resposta.status === 422) {
    entregadorAuthService.logout();
    window.location.href = "/entregador/login";
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

export const pedidosService = {
  async listarPedidos(): Promise<Pedido[]> {
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
  },

  async atualizarStatusPedido(
    pedidoId: string,
    novoStatus: StatusPedidoType,
  ): Promise<void> {
    const resposta = await fetch(`${API_URL}/pedidos/${pedidoId}/status`, {
      method: "PATCH",
      headers: getHeaders(),
      body: JSON.stringify({ status: novoStatus }),
    });

    verificarSessao(resposta);

    if (!resposta.ok) {
      throw new Error(await obterErro(resposta));
    }
  },

  async buscarPedido(id: string): Promise<Pedido | null> {
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
  },
};
