import type { Bebida } from "../types/bebidas";

const BEBIDAS_URL = "/api/todasAsBebidas.json";

export async function buscarBebidas(): Promise<Bebida[]> {
  const resposta = await fetch(BEBIDAS_URL);

  if (!resposta.ok) {
    throw new Error("Não foi possível carregar o catálogo de bebidas");
  }

  const texto = await resposta.text();

  return texto.trim().length > 0 ? (JSON.parse(texto) as Bebida[]) : [];
}

export async function buscarBebidaPorId(id: string): Promise<Bebida | null> {
  const bebidas = await buscarBebidas();

  return bebidas.find((bebida) => bebida.id === id) ?? null;
}
