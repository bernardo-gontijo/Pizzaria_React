import type { Mesa, MesaInput, HistoricoMesa } from "../types/mesa";
import type { ItemPedido } from "../../loja/types/pedido";
import {
  criarPedido,
  buscarPedidoPorId,
  atualizarItensPedido,
} from "../../loja/api/pedidos.service";

const MESAS_STORAGE_KEY = "pizzashop:mesas";
const HISTORICO_STORAGE_KEY = "pizzashop:historico-mesas";

export const MESAS_ATUALIZADAS_EVENT = "pizzashop:mesas-atualizadas";

function lerMesas(): Mesa[] {
  const dados = localStorage.getItem(MESAS_STORAGE_KEY);

  if (!dados) return [];

  try {
    return JSON.parse(dados) as Mesa[];
  } catch {
    localStorage.removeItem(MESAS_STORAGE_KEY);
    return [];
  }
}

function salvarMesas(mesas: Mesa[]): void {
  localStorage.setItem(MESAS_STORAGE_KEY, JSON.stringify(mesas));
  window.dispatchEvent(new Event(MESAS_ATUALIZADAS_EVENT));
}

function lerHistorico(): HistoricoMesa[] {
  const dados = localStorage.getItem(HISTORICO_STORAGE_KEY);

  if (!dados) return [];

  try {
    return JSON.parse(dados) as HistoricoMesa[];
  } catch {
    localStorage.removeItem(HISTORICO_STORAGE_KEY);
    return [];
  }
}

function salvarHistorico(historico: HistoricoMesa[]): void {
  localStorage.setItem(HISTORICO_STORAGE_KEY, JSON.stringify(historico));
}

export async function buscarMesas(): Promise<Mesa[]> {
  return lerMesas();
}

export async function criarMesa(dados: MesaInput): Promise<Mesa> {
  const mesas = lerMesas();

  const jaExiste = mesas.some((mesa) => mesa.numero === dados.numero);

  if (jaExiste) {
    throw new Error(
      `Já existe uma mesa cadastrada com o número ${dados.numero}.`,
    );
  }

  const novaMesa: Mesa = {
    id: crypto.randomUUID(),
    numero: dados.numero,
    status: "livre",
  };

  salvarMesas([...mesas, novaMesa]);

  return novaMesa;
}

export async function removerMesa(id: string): Promise<void> {
  const mesas = lerMesas();

  salvarMesas(mesas.filter((mesa) => mesa.id !== id));
}

/**
 * Abre uma mesa: cria um pedido vazio vinculado a ela e marca a mesa
 * como ocupada. O garçom adiciona itens a esse pedido conforme o
 * cliente vai pedindo (ver adicionarItemNaMesa).
 */
export async function abrirMesa(mesaId: string): Promise<Mesa> {
  const mesas = lerMesas();
  const mesa = mesas.find((m) => m.id === mesaId);

  if (!mesa) {
    throw new Error("Mesa não encontrada");
  }

  const pedido = await criarPedido({
    cliente: { nome: `Mesa ${mesa.numero}`, telefone: "" },
    itens: [],
    formaPagamento: "dinheiro",
    mesaId: mesa.id,
  });

  const mesasAtualizadas = mesas.map((m) =>
    m.id === mesaId
      ? { ...m, status: "ocupada" as const, pedidoAtualId: pedido.id }
      : m,
  );

  salvarMesas(mesasAtualizadas);

  return mesasAtualizadas.find((m) => m.id === mesaId)!;
}

/**
 * Adiciona um item ao pedido atual da mesa. A mesa precisa já estar
 * aberta (ver abrirMesa).
 */
export async function adicionarItemNaMesa(
  mesaId: string,
  item: Omit<ItemPedido, "id">,
) {
  const mesas = lerMesas();
  const mesa = mesas.find((m) => m.id === mesaId);

  if (!mesa?.pedidoAtualId) {
    throw new Error("Mesa não está aberta");
  }

  const pedido = await buscarPedidoPorId(mesa.pedidoAtualId);

  if (!pedido) {
    throw new Error("Pedido da mesa não encontrado");
  }

  const itensAtualizados = [
    ...pedido.itens.map(({ id: _id, ...resto }) => resto),
    item,
  ];

  return atualizarItensPedido(mesa.pedidoAtualId, itensAtualizados);
}

/**
 * Encerra a conta da mesa: registra o pedido no histórico (para
 * prestação de contas), com a gorjeta informada (opcional, o cliente
 * decide se paga), e libera a mesa para um novo atendimento.
 */
export async function encerrarContaMesa(
  mesaId: string,
  gorjeta?: number,
): Promise<HistoricoMesa> {
  const mesas = lerMesas();
  const mesa = mesas.find((m) => m.id === mesaId);

  if (!mesa?.pedidoAtualId) {
    throw new Error("Mesa não está aberta");
  }

  const pedido = await buscarPedidoPorId(mesa.pedidoAtualId);

  if (!pedido) {
    throw new Error("Pedido da mesa não encontrado");
  }

  const registro: HistoricoMesa = {
    id: crypto.randomUUID(),
    mesaId: mesa.id,
    numeroMesa: mesa.numero,
    pedidoId: pedido.id,
    subtotal: pedido.subtotal,
    gorjeta,
    encerradoEm: new Date().toISOString(),
  };

  salvarHistorico([...lerHistorico(), registro]);

  const mesasAtualizadas = mesas.map((m) =>
    m.id === mesaId
      ? { id: m.id, numero: m.numero, status: "livre" as const }
      : m,
  );

  salvarMesas(mesasAtualizadas);

  return registro;
}

export async function buscarHistoricoMesas(): Promise<HistoricoMesa[]> {
  return lerHistorico();
}
