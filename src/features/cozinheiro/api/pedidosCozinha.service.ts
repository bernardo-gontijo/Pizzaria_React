import { getCozinhaToken, limparSessaoCozinha } from "./cozinhaAuth.service";

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

async function obterErro(resposta: Response): Promise<string> {
  try {
    const dados = (await resposta.json()) as { erro?: string; msg?: string };
    return dados.erro ?? dados.msg ?? "Erro ao acessar o servidor";
  } catch {
    return "Erro ao acessar o servidor";
  }
}

async function fetchAutenticado(
  url: string,
  opcoes: RequestInit,
): Promise<Response> {
  const token = await getCozinhaToken();

  const resposta = await fetch(url, {
    ...opcoes,
    headers: {
      ...opcoes.headers,
      Authorization: `Bearer ${token}`,
    },
  });

  if (resposta.status === 401 || resposta.status === 422) {
    limparSessaoCozinha();

    const novoToken = await getCozinhaToken();

    return fetch(url, {
      ...opcoes,
      headers: {
        ...opcoes.headers,
        Authorization: `Bearer ${novoToken}`,
      },
    });
  }

  return resposta;
}

export async function buscarPedidos(): Promise<Pedido[]> {
  const resposta = await fetchAutenticado(`${API_URL}/pedidos/admin`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

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
  const resposta = await fetchAutenticado(`${API_URL}/pedidos/${id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status: dados.status }),
  });

  if (!resposta.ok) {
    throw new Error(await obterErro(resposta));
  }

  return normalizarPedido((await resposta.json()) as PedidoApi);
}
