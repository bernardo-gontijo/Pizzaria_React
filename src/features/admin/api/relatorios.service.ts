import { getAdminToken } from "./auth.service";

const API_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:5000";

export type Agrupamento = "dia" | "semana" | "mes";

export interface PontoFaturamento {
  periodo: string;
  faturamento: number;
}

export interface ResumoPeriodo {
  faturamento: number;
  ticketMedio: number;
  totalPedidos: number;
  pizzaMaisVendida: { pizza: string; quantidade: number } | null;
  formaPagamentoMaisUsada: string | null;
}

export interface ProdutoMaisVendido {
  produto: string;
  quantidade: number;
  faturamento: number;
}

export interface FormaPagamentoResumo {
  formaPagamento: string;
  quantidade: number;
  faturamento: number;
}

export interface FiltroPeriodo {
  inicio?: string; // "YYYY-MM-DD"
  fim?: string; // "YYYY-MM-DD"
}

function montarQuery(filtro: FiltroPeriodo, extra?: Record<string, string>) {
  const params = new URLSearchParams();

  if (filtro.inicio) params.set("inicio", filtro.inicio);
  if (filtro.fim) params.set("fim", filtro.fim);

  if (extra) {
    for (const [chave, valor] of Object.entries(extra)) {
      params.set(chave, valor);
    }
  }

  const query = params.toString();
  return query ? `?${query}` : "";
}

function getHeaders(): HeadersInit {
  const token = getAdminToken();

  if (!token) {
    throw new Error("Sessão expirada. Faça login novamente.");
  }

  return { Authorization: `Bearer ${token}` };
}

async function obterErro(resposta: Response): Promise<string> {
  try {
    const dados = (await resposta.json()) as { erro?: string };
    return dados.erro ?? "Erro ao acessar o servidor";
  } catch {
    return "Erro ao acessar o servidor";
  }
}

export async function buscarFaturamentoPorPeriodo(
  filtro: FiltroPeriodo,
  agrupar: Agrupamento,
): Promise<PontoFaturamento[]> {
  const resposta = await fetch(
    `${API_URL}/relatorios/faturamento${montarQuery(filtro, { agrupar })}`,
    { headers: getHeaders() },
  );

  if (!resposta.ok) throw new Error(await obterErro(resposta));

  return (await resposta.json()) as PontoFaturamento[];
}

export async function buscarResumoPeriodo(
  filtro: FiltroPeriodo,
): Promise<ResumoPeriodo> {
  const resposta = await fetch(
    `${API_URL}/relatorios/resumo${montarQuery(filtro)}`,
    { headers: getHeaders() },
  );

  if (!resposta.ok) throw new Error(await obterErro(resposta));

  return (await resposta.json()) as ResumoPeriodo;
}

export async function buscarProdutosMaisVendidos(
  filtro: FiltroPeriodo,
  limite = 5,
): Promise<ProdutoMaisVendido[]> {
  const resposta = await fetch(
    `${API_URL}/relatorios/produtos-mais-vendidos${montarQuery(filtro, {
      limite: String(limite),
    })}`,
    { headers: getHeaders() },
  );

  if (!resposta.ok) throw new Error(await obterErro(resposta));

  return (await resposta.json()) as ProdutoMaisVendido[];
}

export async function buscarFormasPagamento(
  filtro: FiltroPeriodo,
): Promise<FormaPagamentoResumo[]> {
  const resposta = await fetch(
    `${API_URL}/relatorios/formas-pagamento${montarQuery(filtro)}`,
    { headers: getHeaders() },
  );

  if (!resposta.ok) throw new Error(await obterErro(resposta));

  return (await resposta.json()) as FormaPagamentoResumo[];
}