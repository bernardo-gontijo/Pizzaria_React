export interface EntregadorUser {
  nome: string;
  email: string;
  role: string;
}

const API_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:5000";

const STORAGE_KEY = "pizzashop:entregador-auth";

interface EntregadorSessao {
  token: string;
  usuario: EntregadorUser;
}

interface LoginResponse {
  token: string;
  usuario: EntregadorUser;
}

function getSessao(): EntregadorSessao | null {
  const dados = localStorage.getItem(STORAGE_KEY);

  if (!dados) return null;

  try {
    return JSON.parse(dados) as EntregadorSessao;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

export function getEntregadorToken(): string | null {
  return getSessao()?.token ?? null;
}

export const entregadorAuthService = {
  getUser(): EntregadorUser | null {
    return getSessao()?.usuario ?? null;
  },

  isAuthenticated(): boolean {
    return getSessao() !== null;
  },

  getNome(): string {
    return getSessao()?.usuario.nome ?? "Entregador";
  },

  async login(email: string, senha: string): Promise<EntregadorUser> {
    const resposta = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, senha }),
    });

    const dados = (await resposta.json()) as LoginResponse & {
      erro?: string;
    };

    if (!resposta.ok) {
      throw new Error(dados.erro ?? "E-mail ou senha inválidos");
    }

    if (dados.usuario.role !== "entregador") {
      throw new Error("Esta conta não tem permissão de entregador.");
    }

    const sessao: EntregadorSessao = {
      token: dados.token,
      usuario: dados.usuario,
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessao));

    return dados.usuario;
  },

  logout(): void {
    localStorage.removeItem(STORAGE_KEY);
  },
};
