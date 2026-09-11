import { getClienteToken, logoutCliente } from "./clienteAuth.service";

const API_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:5000";

export interface Avaliacao {
  id: number;
  pedidoId: number;
  pizzaId: string;
  pizzaNome: string;
  nota: number;
  comentario: string | null;
  criadoEm: string;
  clienteNome?: string;
}

export interface AvaliacoesDaPizza {
  pizzaId: string;
  media: number | null;
  total: number;
  avaliacoes: Avaliacao[];
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
    const dados = (await resposta.json()) as { erro?: string; msg?: string };
    return dados.erro ?? dados.msg ?? "Erro ao acessar o servidor";
  } catch {
    return "Erro ao acessar o servidor";
  }
}

export async function criarAvaliacao(dados: {
  pedidoId: number;
  pizzaId: string;
  nota: number;
  comentario?: string;
}): Promise<Avaliacao> {
  const resposta = await fetch(`${API_URL}/avaliacoes`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(dados),
  });

  verificarSessao(resposta);

  if (!resposta.ok) {
    throw new Error(await obterErro(resposta));
  }

  return (await resposta.json()) as Avaliacao;
}

export async function buscarAvaliacoesDoPedido(
  pedidoId: number,
): Promise<Avaliacao[]> {
  const resposta = await fetch(`${API_URL}/avaliacoes/pedido/${pedidoId}`, {
    method: "GET",
    headers: getHeaders(),
  });

  verificarSessao(resposta);

  if (!resposta.ok) {
    throw new Error(await obterErro(resposta));
  }

  return (await resposta.json()) as Avaliacao[];
}

export async function buscarAvaliacoesDaPizza(
  pizzaId: string,
): Promise<AvaliacoesDaPizza> {
  const resposta = await fetch(`${API_URL}/avaliacoes/pizza/${pizzaId}`, {
    method: "GET",
  });

  if (!resposta.ok) {
    throw new Error(await obterErro(resposta));
  }

  return (await resposta.json()) as AvaliacoesDaPizza;
}
