// src/features/entregador/hooks/useEntregadorPedidos.ts
import { useState, useEffect, useCallback } from 'react';
import { pedidosService } from '../services/pedidos.service';
import { type Pedido } from '../types/entregador.types';

export const useEntregadorPedidos = () => {
  const [pedidosProntos, setPedidosProntos] = useState<Pedido[]>([]);
  const [pedidosEmRota, setPedidosEmRota] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const carregarPedidos = useCallback(async () => {
    console.log('🔄 Carregando pedidos...');
    setLoading(true);
    setError(null);
    try {
      const todosPedidos = await pedidosService.listarPedidos();
      console.log('📦 Todos os pedidos:', todosPedidos);
      
      // Filtra pedidos prontos para retirar
      const prontos = todosPedidos.filter(p => p.status === 'pronto');
      console.log('✅ Pedidos prontos:', prontos);
      setPedidosProntos(prontos);
      
      // Filtra pedidos em rota de entrega
      const emRota = todosPedidos.filter(p => p.status === 'saiu_para_entrega');
      console.log('🚚 Pedidos em rota:', emRota);
      setPedidosEmRota(emRota);
    } catch (err) {
      console.error('❌ Erro ao carregar pedidos:', err);
      setError('Erro ao carregar pedidos');
    } finally {
      setLoading(false);
      console.log('🏁 Carregamento finalizado');
    }
  }, []);

  const saiuParaEntrega = useCallback(async (pedidoId: string) => {
    console.log(`🚚 Pedido ${pedidoId} saiu para entrega`);
    try {
      await pedidosService.atualizarStatusPedido(pedidoId, 'saiu_para_entrega');
      await carregarPedidos();
    } catch (err) {
      console.error('❌ Erro ao atualizar status:', err);
      setError('Erro ao atualizar status');
    }
  }, [carregarPedidos]);

  const marcarEntregue = useCallback(async (pedidoId: string) => {
    console.log(`✅ Pedido ${pedidoId} entregue`);
    try {
      await pedidosService.atualizarStatusPedido(pedidoId, 'entregue');
      await carregarPedidos();
    } catch (err) {
      console.error('❌ Erro ao marcar como entregue:', err);
      setError('Erro ao marcar como entregue');
    }
  }, [carregarPedidos]);

  useEffect(() => {
    carregarPedidos();
  }, [carregarPedidos]);

  return {
    pedidosProntos,
    pedidosEmRota,
    loading,
    error,
    saiuParaEntrega,
    marcarEntregue,
    carregarPedidos,
  };
};