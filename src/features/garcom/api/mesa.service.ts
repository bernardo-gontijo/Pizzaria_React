import { getGarcomToken, logout as logoutGarcom } from "./auth.service";

import {
  getAdminToken,
  logout as logoutAdmin,
} from "../../admin/api/auth.service";

import {
  atualizarItensPedido,
  buscarPedidoPorId,
  criarPedido,
} from "./pedidosGarcom.service";

import type { ItemPedido, Pedido } from "../../loja/types/pedido";

import type { HistoricoMesa, Mesa, MesaInput } from "../types/mesa";

const API_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:5000";

export const MESAS_ATUALIZADAS_EVENT = "pizzashop:mesas-atualizadas";

export interface Comanda {
  id: number;
  mesaId: string;
  nome?: string | null;
  status: "aberta" | "paga";
  pedidos: Pedido[];
  createdAt: string;
  updatedAt: string;
}

interface MesaApi extends Mesa {
  comandas: Comanda[];
  createdAt?: string;
  updatedAt?: string;
}

interface PagamentoComandaResponse {
  comanda: Comanda;
  mesa: MesaApi;
}

interface SessaoApi {
  token: string;
  logout: () => void;
  loginPath: string;
}

function getSessaoApi(): SessaoApi {
  const estaNaAreaAdmin = window.location.pathname.startsWith("/admin");

  const estaNaAreaGarcom = window.location.pathname.startsWith("/garcom");

  if (estaNaAreaAdmin) {
    const adminToken = getAdminToken();

    if (adminToken) {
      return {
        token: adminToken,
        logout: logoutAdmin,
        loginPath: "/admin/login",
      };
    }

    const garcomToken = getGarcomToken();

    if (garcomToken) {
      return {
        token: garcomToken,
        logout: logoutGarcom,
        loginPath: "/garcom/login",
      };
    }
  }

  if (estaNaAreaGarcom) {
    const garcomToken = getGarcomToken();

    if (garcomToken) {
      return {
        token: garcomToken,
        logout: logoutGarcom,
        loginPath: "/garcom/login",
      };
    }

    const adminToken = getAdminToken();

    if (adminToken) {
      return {
        token: adminToken,
        logout: logoutAdmin,
        loginPath: "/admin/login",
      };
    }
  }

  const garcomToken = getGarcomToken();

  if (garcomToken) {
    return {
      token: garcomToken,
      logout: logoutGarcom,
      loginPath: "/garcom/login",
    };
  }

  const adminToken = getAdminToken();

  if (adminToken) {
    return {
      token: adminToken,
      logout: logoutAdmin,
      loginPath: "/admin/login",
    };
  }

  throw new Error("Você precisa entrar para acessar as mesas.");
}

function getHeaders(sessao: SessaoApi): HeadersInit {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${sessao.token}`,
  };
}

function verificarSessao(resposta: Response, sessao: SessaoApi): void {
  if (resposta.status === 401 || resposta.status === 422) {
    sessao.logout();

    window.location.href = sessao.loginPath;

    throw new Error("Sua sessão expirou. Entre novamente.");
  }
}

async function obterErro(resposta: Response): Promise<string> {
  try {
    const dados = (await resposta.json()) as {
      erro?: string;
      msg?: string;
    };

    return dados.erro ?? dados.msg ?? "Erro ao acessar o servidor.";
  } catch {
    return "Erro ao acessar o servidor.";
  }
}

async function requisicao<T>(
  caminho: string,
  opcoes: RequestInit = {},
): Promise<T> {
  const sessao = getSessaoApi();

  const resposta = await fetch(`${API_URL}${caminho}`, {
    ...opcoes,
    headers: {
      ...getHeaders(sessao),
      ...opcoes.headers,
    },
  });

  verificarSessao(resposta, sessao);

  if (!resposta.ok) {
    throw new Error(await obterErro(resposta));
  }

  if (resposta.status === 204) {
    return undefined as T;
  }

  return (await resposta.json()) as T;
}

function avisarAtualizacaoMesas(): void {
  window.dispatchEvent(new Event(MESAS_ATUALIZADAS_EVENT));
}

export async function buscarMesas(): Promise<Mesa[]> {
  return requisicao<MesaApi[]>("/mesas", {
    method: "GET",
  });
}

export async function buscarMesaPorId(mesaId: string): Promise<MesaApi> {
  return requisicao<MesaApi>(`/mesas/${mesaId}`, {
    method: "GET",
  });
}

export async function criarMesa(dados: MesaInput): Promise<Mesa> {
  const mesa = await requisicao<MesaApi>("/mesas", {
    method: "POST",

    body: JSON.stringify({
      numero: dados.numero,
    }),
  });

  avisarAtualizacaoMesas();

  return mesa;
}

export async function removerMesa(id: string): Promise<void> {
  await requisicao<void>(`/mesas/${id}`, {
    method: "DELETE",
  });

  avisarAtualizacaoMesas();
}

export async function buscarComandasDaMesa(mesaId: string): Promise<Comanda[]> {
  return requisicao<Comanda[]>(`/mesas/${mesaId}/comandas`, {
    method: "GET",
  });
}

export async function criarComanda(
  mesaId: string,
  nome?: string,
): Promise<Comanda> {
  const comanda = await requisicao<Comanda>(`/mesas/${mesaId}/comandas`, {
    method: "POST",

    body: JSON.stringify({
      nome: nome?.trim() || undefined,
    }),
  });

  avisarAtualizacaoMesas();

  return comanda;
}

export async function vincularPedidoComanda(
  comandaId: number,
  pedidoId: string,
): Promise<Comanda> {
  return requisicao<Comanda>(`/comandas/${comandaId}/pedidos/${pedidoId}`, {
    method: "POST",
  });
}

export async function pagarComanda(
  comandaId: number,
): Promise<PagamentoComandaResponse> {
  const resultado = await requisicao<PagamentoComandaResponse>(
    `/comandas/${comandaId}/pagar`,
    {
      method: "PATCH",
    },
  );

  avisarAtualizacaoMesas();

  return resultado;
}

export async function abrirMesa(mesaId: string): Promise<Mesa> {
  const mesa = await buscarMesaPorId(mesaId);

  const comandasAbertas = mesa.comandas.filter(
    (comanda) => comanda.status === "aberta",
  );

  if (comandasAbertas.length === 0) {
    await criarComanda(mesaId, "Comanda principal");
  }

  return buscarMesaPorId(mesaId);
}

async function obterComanda(
  mesaId: string,
  comandaId?: number,
): Promise<Comanda> {
  const comandas = await buscarComandasDaMesa(mesaId);

  if (comandaId !== undefined) {
    const comandaSelecionada = comandas.find(
      (comanda) => comanda.id === comandaId,
    );

    if (!comandaSelecionada) {
      throw new Error("Comanda não encontrada.");
    }

    if (comandaSelecionada.status === "paga") {
      throw new Error("Esta comanda já foi paga.");
    }

    return comandaSelecionada;
  }

  const aberta = comandas.find((comanda) => comanda.status === "aberta");

  if (aberta) {
    return aberta;
  }

  return criarComanda(mesaId, "Comanda principal");
}

async function obterPedidoDaComanda(
  mesaId: string,
  comanda: Comanda,
): Promise<Pedido> {
  if (comanda.pedidos.length > 0) {
    return comanda.pedidos[0];
  }

  const mesa = await buscarMesaPorId(mesaId);

  const pedido = await criarPedido({
    cliente: {
      nome: comanda.nome || `Mesa ${mesa.numero}`,

      telefone: "",
    },

    itens: [],

    formaPagamento: "dinheiro",

    mesaId,
  });

  await vincularPedidoComanda(comanda.id, pedido.id);

  return pedido;
}

export async function adicionarItemNaMesa(
  mesaId: string,
  item: Omit<ItemPedido, "id">,
  comandaId?: number,
): Promise<Pedido | null> {
  const comanda = await obterComanda(mesaId, comandaId);

  const pedido = await obterPedidoDaComanda(mesaId, comanda);

  const pedidoAtual = await buscarPedidoPorId(pedido.id);

  if (!pedidoAtual) {
    throw new Error("Pedido da comanda não encontrado.");
  }

  const itensExistentes = pedidoAtual.itens.map(
    ({ id: _id, ...resto }) => resto,
  );

  const indiceExistente = itensExistentes.findIndex(
    (existente) =>
      existente.pizzaId === item.pizzaId && existente.size === item.size,
  );

  const itensAtualizados =
    indiceExistente >= 0
      ? itensExistentes.map((existente, index) =>
          index === indiceExistente
            ? {
                ...existente,

                quantity: existente.quantity + item.quantity,
              }
            : existente,
        )
      : [...itensExistentes, item];

  return atualizarItensPedido(pedidoAtual.id, itensAtualizados);
}

export async function atualizarQuantidadeItemNaMesa(
  mesaId: string,
  itemId: string,
  quantidade: number,
  comandaId?: number,
): Promise<Pedido | null> {
  const comanda = await obterComanda(mesaId, comandaId);

  const pedido = await obterPedidoDaComanda(mesaId, comanda);

  const pedidoAtual = await buscarPedidoPorId(pedido.id);

  if (!pedidoAtual) {
    throw new Error("Pedido da comanda não encontrado.");
  }

  const quantidadeSegura = Math.max(1, quantidade);

  const itensAtualizados = pedidoAtual.itens.map((existente) => {
    const { id, ...resto } = existente;

    return id === itemId
      ? {
          ...resto,

          quantity: quantidadeSegura,
        }
      : resto;
  });

  return atualizarItensPedido(pedidoAtual.id, itensAtualizados);
}

export async function removerItemNaMesa(
  mesaId: string,
  itemId: string,
  comandaId?: number,
): Promise<Pedido | null> {
  const comanda = await obterComanda(mesaId, comandaId);

  const pedido = await obterPedidoDaComanda(mesaId, comanda);

  const pedidoAtual = await buscarPedidoPorId(pedido.id);

  if (!pedidoAtual) {
    throw new Error("Pedido da comanda não encontrado.");
  }

  const itensAtualizados = pedidoAtual.itens
    .filter((existente) => existente.id !== itemId)
    .map(({ id: _id, ...resto }) => resto);

  return atualizarItensPedido(pedidoAtual.id, itensAtualizados);
}

export async function encerrarContaMesa(
  mesaId: string,
  gorjeta?: number,
): Promise<HistoricoMesa> {
  const mesa = await buscarMesaPorId(mesaId);

  const comanda = mesa.comandas.find((item) => item.status === "aberta");

  if (!comanda) {
    throw new Error("Não existe comanda aberta nesta mesa.");
  }

  const pedido = comanda.pedidos[0];

  const pagamento = await pagarComanda(comanda.id);

  return {
    id: `comanda-${pagamento.comanda.id}`,

    mesaId,

    numeroMesa: mesa.numero,

    pedidoId: pedido?.id ?? "",

    subtotal: pedido?.subtotal ?? 0,

    gorjeta,

    encerradoEm: new Date().toISOString(),
  };
}

export async function buscarHistoricoMesas(): Promise<HistoricoMesa[]> {
  return [];
}
