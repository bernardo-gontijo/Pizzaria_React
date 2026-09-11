import type { AuthUser } from "../types/auth";

const API_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:5000";

const STORAGE_KEY = "pizzashop:garcom-auth";

interface GarcomSessao {
  token: string;
  usuario: AuthUser;
}

interface LoginResponse {
  token: string;
  usuario: AuthUser;
}

function getSessao(): GarcomSessao | null {
  const dados = localStorage.getItem(STORAGE_KEY);

  if (!dados) return null;

  try {
    return JSON.parse(dados) as GarcomSessao;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

export function getGarcomToken(): string | null {
  return getSessao()?.token ?? null;
}

export function getAuthenticatedUser(): AuthUser | null {
  return getSessao()?.usuario ?? null;
}

export async function login(email: string, senha: string): Promise<AuthUser> {
  const resposta = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, senha }),
  });

  const dados = (await resposta.json()) as LoginResponse & { erro?: string };

  if (!resposta.ok) {
    throw new Error(dados.erro ?? "E-mail ou senha inválidos");
  }

  if (dados.usuario.role !== "garcom") {
    throw new Error("Esta conta não tem permissão de garçom.");
  }

  const sessao: GarcomSessao = { token: dados.token, usuario: dados.usuario };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessao));

  return dados.usuario;
}

export function logout(): void {
  localStorage.removeItem(STORAGE_KEY);
}
