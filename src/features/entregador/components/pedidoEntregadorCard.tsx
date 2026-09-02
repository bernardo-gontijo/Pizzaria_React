// src/features/entregador/components/PedidoEntregadorCard.tsx
import { User, MapPin, ShoppingBag, Phone } from 'lucide-react';
import { type Pedido } from '../types/entregador.types';

interface Props {
  pedido: Pedido;
  onAction: (id: string) => Promise<void>;
  loading: boolean;
  tipo: 'pronto' | 'emRota';
}

export const PedidoEntregadorCard: React.FC<Props> = ({ 
  pedido, 
  onAction, 
  loading,
  tipo 
}) => {
  const isPronto = tipo === 'pronto';
  
  console.log('🎴 Renderizando card:', pedido.id, pedido.status);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h4 className="font-bold text-lg text-gray-800">
            Pedido #{pedido.id}
          </h4>
          <span className={`text-xs px-2 py-1 rounded-full ${
            isPronto ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'
          }`}>
            {isPronto ? '✅ Pronto' : '🚚 Em rota'}
          </span>
        </div>
        <span className="text-lg font-bold text-green-600">
          R$ {pedido.total?.toFixed(2) || '0,00'}
        </span>
      </div>

      <div className="space-y-2 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <User size={16} className="text-gray-400" />
          <span><strong>Cliente:</strong> {pedido.cliente?.nome || 'Não informado'}</span>
        </div>
        {pedido.cliente?.telefone && (
          <div className="flex items-center gap-2">
            <Phone size={16} className="text-gray-400" />
            <span><strong>Telefone:</strong> {pedido.cliente.telefone}</span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <MapPin size={16} className="text-gray-400" />
          <span><strong>Endereço:</strong> {pedido.endereco || 'Não informado'}</span>
        </div>
        <div className="flex items-center gap-2">
          <ShoppingBag size={16} className="text-gray-400" />
          <span><strong>Itens:</strong> {pedido.itens?.length || 0} produtos</span>
        </div>
      </div>

      <button
        onClick={() => {
          console.log(`🔘 Botão clicado para pedido ${pedido.id}`);
          onAction(pedido.id);
        }}
        disabled={loading}
        className={`mt-4 w-full py-2.5 px-4 rounded-lg transition-all font-medium ${
          isPronto
            ? 'bg-blue-600 hover:bg-blue-700 text-white'
            : 'bg-green-600 hover:bg-green-700 text-white'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="animate-spin">⏳</span> Processando...
          </span>
        ) : isPronto ? (
          '🚚 Saiu para entrega'
        ) : (
          '✅ Marcar como entregue'
        )}
      </button>
    </div>
  );
};