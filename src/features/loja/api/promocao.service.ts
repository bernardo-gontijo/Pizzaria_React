import type { PromocaoDoDia } from "../types/promocao";

const PROMOCAO_STORAGE_KEY = "pizzashop-promocao-do-dia";

export const PROMOCAO_ATUALIZADA_EVENT = "pizzashop:promocao-atualizada";

/**
 * Lê a promoção do dia salva (ou null se nenhuma pizza estiver marcada
 * como promocional no momento).
 */
export async function buscarPromocaoDoDia(): Promise<PromocaoDoDia | null> {
  const dados = localStorage.getItem(PROMOCAO_STORAGE_KEY);

  if (!dados) return null;

  try {
    return JSON.parse(dados) as PromocaoDoDia;
  } catch {
    localStorage.removeItem(PROMOCAO_STORAGE_KEY);
    return null;
  }
}

/**
 * Define (ou substitui) a pizza promocional do dia. Como só existe uma
 * promoção ativa por vez, isso sempre sobrescreve a anterior — não é
 * necessário "desmarcar" a pizza antiga primeiro.
 */
export async function definirPromocaoDoDia(
  promocao: PromocaoDoDia,
): Promise<PromocaoDoDia> {
  localStorage.setItem(PROMOCAO_STORAGE_KEY, JSON.stringify(promocao));
  window.dispatchEvent(new Event(PROMOCAO_ATUALIZADA_EVENT));

  return promocao;
}

/**
 * Remove a promoção do dia, se houver uma ativa.
 */
export async function removerPromocaoDoDia(): Promise<void> {
  localStorage.removeItem(PROMOCAO_STORAGE_KEY);
  window.dispatchEvent(new Event(PROMOCAO_ATUALIZADA_EVENT));
}

/**
 * Calcula o preço final de uma pizza aplicando o percentual de
 * desconto informado. Garante que o resultado nunca fique negativo,
 * mesmo que um percentual inválido (>100) tenha sido salvo por engano.
 */
export function calcularPrecoComDesconto(
  precoOriginal: number,
  percentualDesconto: number,
): number {
  const percentualSeguro = Math.min(100, Math.max(0, percentualDesconto));

  return precoOriginal * (1 - percentualSeguro / 100);
}