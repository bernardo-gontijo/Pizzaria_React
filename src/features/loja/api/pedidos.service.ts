import type {
  Pedido,
  CriarPedidoDTO,
  AtualizarStatusPedidoDTO,
} from "../types/pedido";

// Mock de pedidos em memória
let pedidosCache: Pedido[] = [];

// Inicializar com dados do localStorage
function initPedidos() {
  const stored = localStorage.getItem("pedidos_loja");
  if (stored) {
    try {
      pedidosCache = JSON.parse(stored).map((p: any) => ({
        ...p,
        createdAt: new Date(p.createdAt),
        updatedAt: new Date(p.updatedAt),
        statusHistorico: p.statusHistorico.map((h: any) => ({
          ...h,
          timestamp: new Date(h.timestamp),
        })),
      }));
    } catch (error) {
      console.error("Erro ao carregar pedidos:", error);
      pedidosCache = [];
    }
  } else {
    // Criar pedidos de exemplo
    pedidosCache = [
      {
        id: "1",
        cliente: {
          nome: "João Silva",
          telefone: "(11) 99999-9999",
        },
        endereco: {
          cep: "01234-567",
          rua: "Rua das Flores",
          numero: "123",
          bairro: "Centro",
          cidade: "São Paulo",
          estado: "SP",
        },
        itens: [],
        subtotal: 0,
        taxaEntrega: 5,
        desconto: 0,
        total: 0,
        formaPagamento: "pix",
        status: "pendente",
        statusHistorico: [
          {
            id: "hist-1",
            status: "pendente",
            timestamp: new Date(),
            message: "Pedido recebido",
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
  }
}

initPedidos();

// Salvar no localStorage
function salvarPedidos() {
  try {
    localStorage.setItem("pedidos_loja", JSON.stringify(pedidosCache));
  } catch (error) {
    console.error("Erro ao salvar pedidos:", error);
  }
}

export async function criarPedido(dados: CriarPedidoDTO): Promise<Pedido> {
  try {
    // Simular delay de rede
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Calcular totais
    const subtotal = dados.itens.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );
    const taxaEntrega = 5; // Buscar da configuração do tenant
    const total = subtotal + taxaEntrega;

    const novoPedido: Pedido = {
      id: `pedido-${Date.now()}`,
      cliente: dados.cliente,
      endereco: dados.endereco,
      itens: dados.itens.map((item, index) => ({
        id: `item-${Date.now()}-${index}`,
        ...item,
      })),
      subtotal,
      taxaEntrega,
      desconto: 0,
      total,
      formaPagamento: dados.formaPagamento,
      trocoPara: dados.trocoPara,
      status: "pendente",
      statusHistorico: [
        {
          id: `hist-${Date.now()}`,
          status: "pendente",
          timestamp: new Date(),
          message: "Pedido recebido com sucesso",
        },
      ],
      observacoes: dados.observacoes,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    pedidosCache.unshift(novoPedido);
    salvarPedidos();

    return novoPedido;
  } catch (error) {
    console.error("Erro ao criar pedido:", error);
    throw new Error("Não foi possível criar o pedido. Tente novamente.");
  }
}

export async function buscarPedidos(): Promise<Pedido[]> {
  try {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return [...pedidosCache];
  } catch (error) {
    console.error("Erro ao buscar pedidos:", error);
    return [];
  }
}

export async function buscarPedidoPorId(id: string): Promise<Pedido | null> {
  try {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return pedidosCache.find((p) => p.id === id) || null;
  } catch (error) {
    console.error("Erro ao buscar pedido:", error);
    return null;
  }
}

export async function atualizarStatusPedido(
  id: string,
  dados: AtualizarStatusPedidoDTO,
): Promise<Pedido | null> {
  try {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const index = pedidosCache.findIndex((p) => p.id === id);
    if (index === -1) return null;

    const pedido = pedidosCache[index];

    const novoHistorico = {
      id: `hist-${Date.now()}`,
      status: dados.status,
      timestamp: new Date(),
      message: dados.message || getStatusMessage(dados.status),
    };

    pedido.status = dados.status;
    pedido.statusHistorico.push(novoHistorico);
    pedido.updatedAt = new Date();

    pedidosCache[index] = pedido;
    salvarPedidos();

    return pedido;
  } catch (error) {
    console.error("Erro ao atualizar status:", error);
    throw new Error("Não foi possível atualizar o status do pedido");
  }
}

function getStatusMessage(status: string): string {
  const messages = {
    pendente: "Pedido recebido",
    confirmado: "Pedido confirmado",
    preparando: "Pedido em preparação",
    pronto: "Pedido pronto para entrega",
    entregue: "Pedido entregue",
    cancelado: "Pedido cancelado",
  };
  return messages[status as keyof typeof messages] || "Status atualizado";
}

export async function cancelarPedido(
  id: string,
  motivo?: string,
): Promise<Pedido | null> {
  return await atualizarStatusPedido(id, {
    status: "cancelado",
    message: motivo || "Pedido cancelado pelo cliente",
  });
}

export function limparCachePedidos(): void {
  pedidosCache = [];
}

export async function recarregarPedidos(): Promise<Pedido[]> {
  limparCachePedidos();
  return await buscarPedidos();
}
