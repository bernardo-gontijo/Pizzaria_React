import type { Combo } from "../types/combos";

const COMBOS_URL = "/api/todosOsCombos.json";

export async function buscarCombos(): Promise<Combo[]> {
  const resposta = await fetch(COMBOS_URL);

  if (!resposta.ok) {
    throw new Error("Não foi possível carregar os combos");
  }

  const texto = await resposta.text();

  return texto.trim().length > 0 ? (JSON.parse(texto) as Combo[]) : [];
}

export async function buscarComboPorId(id: string): Promise<Combo | null> {
  const combos = await buscarCombos();

  return combos.find((combo) => combo.id === id) ?? null;
}