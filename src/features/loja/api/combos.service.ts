import type { Combo, ComboResolvido, ComboItemRef } from "../types/combos";
import { buscarPizzas } from "./loja.service";
import { buscarBebidas } from "./bebidas.service";

const COMBOS_STORAGE_KEY = "pizzashop-combos";

// Incrementa este número sempre que a estrutura de dados de Combo for
// alterada de forma incompatível (ex: campo novo obrigatório, mudança
// no formato de ComboItemRef). Isso invalida automaticamente combos
// salvos no navegador com o formato antigo, evitando erros em tempo
// de execução ao ler dados incompatíveis. Mesmo padrão já usado para
// pizzas em loja.service.ts.
const COMBOS_SCHEMA_VERSION = 1;

export const COMBOS_ATUALIZADOS_EVENT = "pizzashop:combos-atualizados";

export type ComboInput = Omit<Combo, "id">;

interface CombosArmazenados {
  version: number;
  combos: Combo[];
}

function lerCombos(): Combo[] {
  const dados = localStorage.getItem(COMBOS_STORAGE_KEY);

  if (!dados) return [];

  try {
    const armazenado = JSON.parse(dados) as CombosArmazenados;

    if (armazenado.version !== COMBOS_SCHEMA_VERSION) {
      localStorage.removeItem(COMBOS_STORAGE_KEY);
      return [];
    }

    return armazenado.combos;
  } catch {
    localStorage.removeItem(COMBOS_STORAGE_KEY);
    return [];
  }
}

function salvarCombos(combos: Combo[]): void {
  const armazenado: CombosArmazenados = {
    version: COMBOS_SCHEMA_VERSION,
    combos,
  };

  localStorage.setItem(COMBOS_STORAGE_KEY, JSON.stringify(armazenado));
  window.dispatchEvent(new Event(COMBOS_ATUALIZADOS_EVENT));
}

export async function buscarCombosCadastrados(): Promise<Combo[]> {
  return lerCombos();
}

export async function adicionarCombo(dados: ComboInput): Promise<Combo> {
  const combos = lerCombos();
  const novoCombo: Combo = { id: crypto.randomUUID(), ...dados };

  salvarCombos([...combos, novoCombo]);

  return novoCombo;
}

export async function editarCombo(
  id: string,
  dados: ComboInput,
): Promise<Combo> {
  const combos = lerCombos();
  const comboAtualizado: Combo = { id, ...dados };

  salvarCombos(
    combos.map((combo) => (combo.id === id ? comboAtualizado : combo)),
  );

  return comboAtualizado;
}

export async function excluirCombo(id: string): Promise<void> {
  const combos = lerCombos();

  salvarCombos(combos.filter((combo) => combo.id !== id));
}

/**
 * Resolve um combo, buscando o nome/preço/imagem atuais de cada item
 * (pizza ou bebida) no cardápio, e calculando o preço original (soma
 * dos itens) e o preço promocional (com o desconto aplicado). Se um
 * item referenciado não existir mais no cardápio, ele é descartado do
 * cálculo (evita quebrar o combo por completo).
 */
async function resolverCombo(combo: Combo): Promise<ComboResolvido> {
  const [pizzas, bebidas] = await Promise.all([
    buscarPizzas(),
    buscarBebidas(),
  ]);

  function resolverItem(ref: ComboItemRef) {
    if (ref.tipo === "pizza") {
      const pizza = pizzas.find((p) => p.id === ref.id);
      if (!pizza) return null;

      return {
        tipo: "pizza" as const,
        id: pizza.id,
        nome: pizza.nome,
        precoUnitario: pizza.preco,
        quantidade: ref.quantidade,
        imagem: pizza.imagem,
        disponivel: pizza.disponivel,
      };
    }

    const bebida = bebidas.find((b) => b.id === ref.id);
    if (!bebida) return null;

    return {
      tipo: "bebida" as const,
      id: bebida.id,
      nome: bebida.nome,
      precoUnitario: bebida.preco,
      quantidade: ref.quantidade,
      imagem: bebida.imagem,
      disponivel: bebida.disponivel,
    };
  }

  const itensResolvidos = combo.itens
    .map(resolverItem)
    .filter((item): item is NonNullable<typeof item> => item !== null);

  const precoOriginal = itensResolvidos.reduce(
    (soma, item) => soma + item.precoUnitario * item.quantidade,
    0,
  );

  const precoPromocional = precoOriginal * (1 - combo.descontoPercentual / 100);

  return {
    id: combo.id,
    nome: combo.nome,
    descricao: combo.descricao,
    itens: itensResolvidos,
    descontoPercentual: combo.descontoPercentual,
    disponivel: combo.disponivel,
    precoOriginal,
    precoPromocional,
    // Usa a imagem do primeiro item resolvido como capa do combo.
    imagem: itensResolvidos[0]?.imagem ?? "/images/banner-pizzaria.jpg",
  };
}

export async function buscarCombosResolvidos(): Promise<ComboResolvido[]> {
  const combos = lerCombos();

  return Promise.all(combos.map(resolverCombo));
}

export async function buscarComboResolvidoPorId(
  id: string,
): Promise<ComboResolvido | null> {
  const combos = lerCombos();
  const combo = combos.find((c) => c.id === id);

  if (!combo) return null;

  return resolverCombo(combo);
}
