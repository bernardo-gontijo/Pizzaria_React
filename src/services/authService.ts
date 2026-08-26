export interface LoginData {
  email: string;
  senha: string;
}

export interface AuthUser {
  id: string;
  nome: string;
  email: string;
  role: 'admin';
}

export async function login(
  dados: LoginData,
): Promise<AuthUser> {
  await new Promise((resolve) =>
    setTimeout(resolve, 800),
  );

  if (
    dados.email !== 'admin@pizzashop.com' ||
    dados.senha !== '123456'
  ) {
    throw new Error('E-mail ou senha inválidos');
  }

  const usuario: AuthUser = {
    id: 'admin-1',
    nome: 'Administrador',
    email: dados.email,
    role: 'admin',
  };

  localStorage.setItem(
    'auth-user',
    JSON.stringify(usuario),
  );
  localStorage.setItem('auth-user', JSON.stringify(usuario));
  return usuario;
}

export function logout(): void {
  localStorage.removeItem('auth-user');
}

export function getAuthenticatedUser(): AuthUser | null {
  const saved = localStorage.getItem('auth-user');

  if (!saved) {
    return null;
  }

  try {
    return JSON.parse(saved) as AuthUser;
  } catch {
    return null;
  }
}
export function isAuthenticated(): boolean {
  return getAuthenticatedUser() !== null;
}