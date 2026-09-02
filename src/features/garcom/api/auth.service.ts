import type { AuthUser } from "../types/auth";

const STORAGE_KEY = "pizzashop:garcom-user";

const MOCK_GARCOM = {
  email: "garcom@pizzashop.com",
  senha: "123456",
  nome: "Garçom",
};

export function getAuthenticatedUser(): AuthUser | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? (JSON.parse(raw) as AuthUser) : null;
}

export async function login(email: string, senha: string): Promise<AuthUser> {
  await new Promise((resolve) => setTimeout(resolve, 500));

  if (email !== MOCK_GARCOM.email || senha !== MOCK_GARCOM.senha) {
    throw new Error("E-mail ou senha inválidos");
  }

  const user: AuthUser = { nome: MOCK_GARCOM.nome, email: MOCK_GARCOM.email };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  return user;
}

export function logout(): void {
  localStorage.removeItem(STORAGE_KEY);
}
