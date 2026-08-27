import { usePizzas } from "../hooks/usePizzas";
import { useCart } from "../../../context/CartContext";
import { ListaPizzas } from "../components/ListaPizzas";
import type { Pizza } from "../types/pizza";

export function CardapioPage() {
    const { pizzas, loading, erro } = usePizzas();
    const { adicionarItem } = useCart();

    function handleAdicionar(pizza: Pizza) {
        adicionarItem({
            id: pizza.id,
            nome: pizza.nome,
            precoUnitario: pizza.preco,
            quantidade: 1,
            observacoes: "",
        });
    }

    if (loading) return <p>Carregando cardápio...</p>;
    if (erro) return <p>Erro: {erro.message}</p>;

    return (
        <div className="cardapio-page">
            <h1>Cardápio</h1>
            <ListaPizzas pizzas={pizzas} />
        </div>
    );
}