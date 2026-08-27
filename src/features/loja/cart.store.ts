// Tipos do Carrinho

export interface CartItem {
    id: string;
    pizza?: any;           // Pizza inteira (opcional)
    nome: string;
    precoUnitario: number;
    quantidade: number;
    tamanho?: string;      // Opcional
    observacoes?: string;
    ingredientesExtras?: string[];  // Opcional
}

export interface CartContextData {
    items: CartItem[];
    adicionarItem: (item: CartItem) => void;
    removerItem: (id: string) => void;
    alterarQuantidade: (id: string, quantidade: number) => void;
    limparCarrinho: () => void;
    subtotal: number;
    taxaEntrega: number;
    total: number;
}