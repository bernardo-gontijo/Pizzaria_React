import { getClienteToken, logoutCliente } from "./clienteAuth.service";

const API_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:5000";

export type TipoDescontoCupom = "percentual" | "fixo";

export interface CupomValido {
  valido: true;
  codigo: string;
  tipoDesconto: TipoDescontoCupom;
  valor: number;
  subtotal: number;
  descontoCalculado: number;
  totalComDesconto: number;
}

export interface CupomInvalido {
  valido: false;
  codigo?: string;
  erro: string;
}

export type ResultadoValidacaoCupom = CupomValido | CupomInvalido;

export interface CupomDisponivel {
  codigo: string;
  tipoDesconto: TipoDescontoCupom;
  valor: number;
  pedidoMinimo: number;
  descontoCalculado: number;
}

export interface CupomQuaseDisponivel {
  codigo: string;
  tipoDesconto: TipoDescontoCupom;
  valor: number;
  pedidoMinimo: number;
  faltanteParaUsar: number;
}

export interface RespostaCuponsDisponiveis {
  subtotal: number;
  disponiveis: CupomDisponivel[];
  quaseDisponiveis: CupomQuaseDisponivel[];
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

export async function validarCupomCliente(
  codigo: string,
  subtotal: number,
): Promise<ResultadoValidacaoCupom> {
  const resposta = await fetch(`${API_URL}/cupons/validar`, {
    method: "POST",
    headers: getHeaders(),

    body: JSON.stringify({
      codigo,
      subtotal,
    }),
  });

  verificarSessao(resposta);

  if (resposta.status === 404) {
    const dados = (await resposta.json()) as {
      codigo?: string;
      erro?: string;
    };

    return {
      valido: false,
      codigo: dados.codigo,
      erro: dados.erro ?? "Cupom não encontrado",
    };
  }

  if (!resposta.ok) {
    throw new Error(await obterErro(resposta));
  }

  return (await resposta.json()) as ResultadoValidacaoCupom;
}

export async function listarCuponsDisponiveis(
  subtotal: number,
): Promise<RespostaCuponsDisponiveis> {
  if (!Number.isFinite(subtotal) || subtotal < 0) {
    throw new Error("Subtotal inválido para consultar cupons.");
  }

  const parametros = new URLSearchParams({
    subtotal: String(subtotal),
  });

  const resposta = await fetch(
    `${API_URL}/cupons/disponiveis?${parametros.toString()}`,
    {
      method: "GET",
      headers: getHeaders(),
    },
  );

  verificarSessao(resposta);

  if (!resposta.ok) {
    throw new Error(await obterErro(resposta));
  }

  return (await resposta.json()) as RespostaCuponsDisponiveis;
}
