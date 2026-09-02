// src/features/entregador/components/EntregadorHeader.tsx
import { User, Bell } from 'lucide-react';
import { useState, useEffect } from 'react';

interface EntregadorHeaderProps {
  nome: string;
}

export const EntregadorHeader: React.FC<EntregadorHeaderProps> = ({ nome }) => {
  const [dataAtual, setDataAtual] = useState('');

  useEffect(() => {
    const now = new Date();
    const formatted = now.toLocaleDateString('pt-BR', { 
      weekday: 'long', 
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    setDataAtual(formatted);
  }, []);

  return (
    <header className="bg-white border-b px-6 py-4 flex justify-between items-center">
      <div>
        <h2 className="text-xl font-semibold text-gray-800">
          Olá, <span className="text-blue-600">{nome}</span> 👋
        </h2>
        <p className="text-sm text-gray-500">{dataAtual}</p>
      </div>
      
      <div className="flex items-center gap-4">
        <button className="p-2 hover:bg-gray-100 rounded-full relative">
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <User className="text-blue-600" size={20} />
          </div>
          <div>
            <p className="text-sm font-medium">{nome}</p>
            <p className="text-xs text-gray-500">Entregador</p>
          </div>
        </div>
      </div>
    </header>
  );
};