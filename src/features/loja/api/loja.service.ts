import  { type Pizza } from '../types//pizza'

const PIZZAS_URL = '/api/todasAsPizzas.json';

export async function buscarPizzas(): Promise<readonly Pizza[]> {
    const resposta = await fetch(PIZZAS_URL);

    if(!resposta.ok){
        throw new Error('Não foi possível carregar o catalogo de pizzas');
    }

    return (await resposta.json()) as Pizza[];
}

// Função extra para buscar pizza por ID (útil para detalhes)
export async function buscarPizzaPorId(id: string): Promise<Pizza | null> {
    try {
        const pizzas = await buscarPizzas();
        return pizzas.find(p => p.id === id) || null;
    } catch {
        return null;
    }
}

// Função para buscar categorias únicas (extraídas das pizzas)
export async function buscarCategorias(): Promise<string[]> {
    try {
        const pizzas = await buscarPizzas();
        const categorias = new Set(pizzas.map(p => p.categoria));
        return Array.from(categorias);
    } catch {
        return [];
    }
}

// Função para filtrar pizzas (cliente-side)
export function filtrarPizzas(
    pizzas: Pizza[], 
    filtro: { categoria?: string; busca?: string; disponivel?: boolean }
): Pizza[] {
    let resultado = [...pizzas];

    if (filtro.categoria) {
        resultado = resultado.filter(p => p.categoria === filtro.categoria);
    }

    if (filtro.busca) {
        const termo = filtro.busca.toLowerCase();
        resultado = resultado.filter(p =>
            p.nome.toLowerCase().includes(termo) ||
            p.descricao.toLowerCase().includes(termo) ||
            p.ingredientes.some(i => i.toLowerCase().includes(termo))
        );
    }

    if (filtro.disponivel !== undefined) {
        resultado = resultado.filter(p => p.disponivel === filtro.disponivel);
    }

    return resultado;
}