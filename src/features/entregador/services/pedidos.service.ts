// src/features/entregador/services/pedidos.service.ts
import { type Pedido, type StatusPedidoType } from '../types/entregador.types';

// Dados mockados para teste - TODOS com status que vão aparecer
const MOCK_PEDIDOS: Pedido[] = [
  {
    id: '101',
    cliente: { 
      nome: 'João Silva',
      telefone: '(11) 99999-9999'
    },
    endereco: 'Rua das Flores, 123 - Jardim Primavera',
    itens: [
      { nome: 'Pizza Margherita', quantidade: 2, preco: 35.90 },
      { nome: 'Refrigerante', quantidade: 1, preco: 8.00 }
    ],
    total: 79.80,
    status: 'pronto',
    createdAt: new Date().toISOString(),
  },
  {
    id: '102',
    cliente: { 
      nome: 'Maria Santos',
      telefone: '(11) 88888-8888'
    },
    endereco: 'Av. Paulista, 456 - Bela Vista',
    itens: [
      { nome: 'Pizza Calabresa', quantidade: 1, preco: 42.50 }
    ],
    total: 42.50,
    status: 'pronto',
    createdAt: new Date().toISOString(),
  },
  {
    id: '103',
    cliente: { 
      nome: 'Pedro Oliveira',
      telefone: '(11) 77777-7777'
    },
    endereco: 'Rua Augusta, 789 - Consolação',
    itens: [
      { nome: 'Pizza Portuguesa', quantidade: 1, preco: 45.90 }
    ],
    total: 45.90,
    status: 'saiu_para_entrega',
    createdAt: new Date().toISOString(),
  },
  {
    id: '104',
    cliente: { 
      nome: 'Ana Costa',
      telefone: '(11) 66666-6666'
    },
    endereco: 'Rua Oscar Freire, 101 - Jardim Paulista',
    itens: [
      { nome: 'Pizza Quatro Queijos', quantidade: 1, preco: 48.90 }
    ],
    total: 48.90,
    status: 'saiu_para_entrega',
    createdAt: new Date().toISOString(),
  },
];

console.log('📦 MOCK_PEDIDOS carregados:', MOCK_PEDIDOS);

export const pedidosService = {
  async listarPedidos(): Promise<Pedido[]> {
    console.log('📡 Chamando listarPedidos()');
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log('📦 Retornando:', MOCK_PEDIDOS);
    return MOCK_PEDIDOS;
  },

  async atualizarStatusPedido(pedidoId: string, novoStatus: StatusPedidoType): Promise<void> {
    console.log(`📡 Atualizando pedido ${pedidoId} para ${novoStatus}`);
    await new Promise(resolve => setTimeout(resolve, 500));
    const pedido = MOCK_PEDIDOS.find(p => p.id === pedidoId);
    if (pedido) {
      pedido.status = novoStatus;
      console.log(`✅ Pedido ${pedidoId} atualizado para: ${novoStatus}`);
    } else {
      throw new Error(`Pedido ${pedidoId} não encontrado`);
    }
  },

  async buscarPedido(id: string): Promise<Pedido | null> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return MOCK_PEDIDOS.find(p => p.id === id) || null;
  },
};