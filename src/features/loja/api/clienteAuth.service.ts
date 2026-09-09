export interface ClienteAuth {
  id: number;
  nome: string;
  email: string;
  role: string;
}

interface LoginResponse {
  token: string;
  usuario: ClienteAuth;
}

const API_URL =
  import.meta.env.VITE_API_URL ?? "http://127.0.0.1:5000";

const STORAGE_KEY = "pizzashop:cliente-auth";

export interface ClienteSessao {
  token: string;
  usuario: ClienteAuth;
}

export function getClienteSessao(): ClienteSessao | null {
  const dados = localStorage.getItem(STORAGE_KEY);

  if (!dados) return null;

  try {
    return JSON.parse(dados) as ClienteSessao;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

export function getClienteToken(): string | null {
  return getClienteSessao()?.token ?? null;
}

export async function loginCliente(
  email: string,
  senha: string,
): Promise<ClienteSessao> {
  const resposta = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, senha }),
  });

  const dados = (await resposta.json()) as LoginResponse & {
    erro?: string;
  };

  if (!resposta.ok) {
    throw new Error(dados.erro ?? "Não foi possível fazer login");
  }

  const sessao: ClienteSessao = {
    token: dados.token,
    usuario: dados.usuario,
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessao));

  return sessao;
}

export async function cadastrarCliente(
  nome: string,
  email: string,
  senha: string,
): Promise<void> {
  const resposta = await fetch(`${API_URL}/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      nome,
      email,
      senha,
      role: "cliente",
    }),
  });

  const dados = (await resposta.json()) as {
    erro?: string;
  };

  if (!resposta.ok) {
    throw new Error(dados.erro ?? "Não foi possível criar sua conta");
  }
}

export function logoutCliente(): void {
  localStorage.removeItem(STORAGE_KEY);
}