import type { Bebida } from "../types/bebidas";

const BEBIDAS_URL = "/api/todasAsBebidas.json";
const BEBIDAS_STORAGE_KEY = "pizzashop-bebidas";

// Mesmo mecanismo de versionamento usado no catálogo de pizzas
// (loja.service.ts): incrementa quando o catálogo padrão em
// public/api/todasAsBebidas.json for alterado intencionalmente, para
// invalidar o cache salvo no navegador de quem já usou o site antes.
const CATALOGO_VERSION = 1;

export const BEBIDAS_ATUALIZADAS_EVENT = "pizzashop:bebidas-atualizadas";

export type BebidaInput = Omit<Bebida, "id">;

interface BebidasArmazenadas {
  version: number;
  bebidas: Bebida[];
}

function lerBebidasSalvas(): Bebida[] | null {
  const dadosSalvos = localStorage.getItem(BEBIDAS_STORAGE_KEY);

  if (!dadosSalvos) return null;

  try {
    const armazenado = JSON.parse(dadosSalvos) as BebidasArmazenadas;

    if (armazenado.version !== CATALOGO_VERSION) {
      // Catálogo padrão mudou desde o último acesso deste navegador:
      // descarta o cache antigo para exibir o catálogo atualizado.
      localStorage.removeItem(BEBIDAS_STORAGE_KEY);
      return null;
    }

    return armazenado.bebidas;
  } catch {
    localStorage.removeItem(BEBIDAS_STORAGE_KEY);
    return null;
  }
}

function salvarBebidas(bebidas: Bebida[]): void {
  const armazenado: BebidasArmazenadas = {
    version: CATALOGO_VERSION,
    bebidas,
  };

  localStorage.setItem(BEBIDAS_STORAGE_KEY, JSON.stringify(armazenado));
  window.dispatchEvent(new Event(BEBIDAS_ATUALIZADAS_EVENT));
}

async function carregarBebidasIniciais(): Promise<Bebida[]> {
  const resposta = await fetch(BEBIDAS_URL);

  if (!resposta.ok) {
    throw new Error("Não foi possível carregar o catálogo de bebidas");
  }

  const texto = await resposta.text();

  return texto.trim().length > 0 ? (JSON.parse(texto) as Bebida[]) : [];
}

export async function buscarBebidas(): Promise<Bebida[]> {
  const bebidasSalvas = lerBebidasSalvas();

  if (bebidasSalvas) return bebidasSalvas;

  const bebidasIniciais = await carregarBebidasIniciais();
  salvarBebidas(bebidasIniciais);

  return bebidasIniciais;
}

export async function buscarBebidaPorId(id: string): Promise<Bebida | null> {
  const bebidas = await buscarBebidas();

  return bebidas.find((bebida) => bebida.id === id) ?? null;
}

export async function adicionarBebida(dados: BebidaInput): Promise<Bebida> {
  const bebidas = await buscarBebidas();
  const novaBebida: Bebida = { id: crypto.randomUUID(), ...dados };

  salvarBebidas([...bebidas, novaBebida]);

  return novaBebida;
}

export async function editarBebida(
  id: string,
  dados: BebidaInput,
): Promise<Bebida> {
  const bebidas = await buscarBebidas();
  const bebidaAtualizada: Bebida = { id, ...dados };

  salvarBebidas(
    bebidas.map((bebida) => (bebida.id === id ? bebidaAtualizada : bebida)),
  );

  return bebidaAtualizada;
}

export async function excluirBebida(id: string): Promise<void> {
  const bebidas = await buscarBebidas();

  salvarBebidas(bebidas.filter((bebida) => bebida.id !== id));
}