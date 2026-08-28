import type { AuthUser } from "../types/auth";

const STORAGE_KEY = "pizzashop:admin-user";

const MOCK_ADMIN = {
  email: "admin@pizzashop.com",
  senha: "123456",
  nome: "Administrador",
};

export function getAuthenticatedUser(): AuthUser | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? (JSON.parse(raw) as AuthUser) : null;
}

export async function login(email: string, senha: string): Promise<AuthUser> {
  await new Promise((resolve) => setTimeout(resolve, 500));

  if (email !== MOCK_ADMIN.email || senha !== MOCK_ADMIN.senha) {
    throw new Error("E-mail ou senha inválidos");
  }

  const user: AuthUser = { nome: MOCK_ADMIN.nome, email: MOCK_ADMIN.email };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  return user;
}

export function logout(): void {
  localStorage.removeItem(STORAGE_KEY);
}
