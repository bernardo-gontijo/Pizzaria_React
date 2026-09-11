const API_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:5000";

const STORAGE_KEY = "pizzashop:cozinha-auth";

const CREDENCIAIS_COZINHA = {
  email: "cozinha@pizzashop.com",
  senha: "123456",
};

interface CozinhaSessao {
  token: string;
}

function getSessao(): CozinhaSessao | null {
  const dados = localStorage.getItem(STORAGE_KEY);

  if (!dados) return null;

  try {
    return JSON.parse(dados) as CozinhaSessao;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

async function autenticarCozinha(): Promise<CozinhaSessao> {
  const resposta = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(CREDENCIAIS_COZINHA),
  });

  if (!resposta.ok) {
    throw new Error(
      "Não foi possível conectar a área da cozinha ao servidor.",
    );
  }

  const dados = (await resposta.json()) as { token: string };
  const sessao: CozinhaSessao = { token: dados.token };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessao));

  return sessao;
}

export async function getCozinhaToken(): Promise<string> {
  const sessao = getSessao();

  if (sessao) {
    return sessao.token;
  }

  const novaSessao = await autenticarCozinha();

  return novaSessao.token;
}

export function limparSessaoCozinha(): void {
  localStorage.removeItem(STORAGE_KEY);
}
