import type { Pizza } from '../types//pizza'

const PIZZAS_URL = '/api/todasAsPizzas.json';

export async function buscarPizzas(): Promise<readonly Pizza[]> {
    const resposta = await fetch(PIZZAS_URL);

    if(!resposta.ok){
        throw new Error('Não foi possível carregar o catalogo de pizzas');
    }

    return (await resposta.json()) as Pizza[];
}