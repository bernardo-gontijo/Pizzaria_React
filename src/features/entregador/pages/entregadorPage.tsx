// src/features/entregador/pages/EntregadorPage.tsx

export const EntregadorPage = () => {
  // Remova as importações de Sidebar e Header, pois elas já estão no Layout.tsx

  return (
    // Este container vai ficar dentro do <main> do Layout.tsx
    // Ele deve ter fundo branco, bordas arredondadas e sombra, igual aos cards do admin
    <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm">
      {/* Título com cor escura padrão (corrigido) */}
      <h2 className="text-3xl font-bold text-[#0f172a] mb-4">
        Dashboard de Entregas
      </h2>

      {/* Parágrafo com cor cinza legível (corrigido) */}
      <p className="text-gray-600 mb-8">
        Visão geral do status das suas entregas.
      </p>

      {/* Grid dos Cards de status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1 - Amarelo */}
        <div className="bg-yellow-50 p-6 rounded-xl border border-yellow-200">
          <p className="text-sm font-medium text-yellow-900 mb-2">
            Prontos para retirar
          </p>
          <p className="text-4xl font-bold text-yellow-800">0</p>
        </div>

        {/* Card 2 - Azul */}
        <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
          <p className="text-sm font-medium text-blue-900 mb-2">
            Em rota de entrega
          </p>
          <p className="text-4xl font-bold text-blue-800">0</p>
        </div>

        {/* Card 3 - Verde */}
        <div className="bg-green-50 p-6 rounded-xl border border-green-200">
          <p className="text-sm font-medium text-green-900 mb-2">
            Entregues hoje
          </p>
          <p className="text-4xl font-bold text-green-800">0</p>
        </div>
      </div>
    </div>
  );
};
