import { useParams } from "react-router-dom";
import { usePizzas } from "../hooks/usePizzas";
import { useCart } from "../../../context/CartContext";
import { ListaPizzas } from "../components/ListaPizzas";
import type { Pizza } from "../types/pizza";

export function CategoriaPage() {
    const { categoria } = useParams<{ categoria: string }>();
    const { pizzas, loading, erro } = usePizzas();
    const { adicionarItem } = useCart();

    const pizzasFiltradas = pizzas.filter(
        (p) => p.categoria.toLowerCase() === categoria?.toLowerCase()
    );

    function handleAdicionar(pizza: Pizza) {
        adicionarItem({
            id: pizza.id,
            nome: pizza.nome,
            precoUnitario: pizza.preco,
            quantidade: 1,
            observacoes: "",
        });
    }

    if (loading) return <p>Carregando...</p>;
    if (erro) return <p>Erro: {erro.message}</p>;

    return (
        <div className="categoria-page">
            <h1>{categoria}</h1>
            <ListaPizzas pizzas={pizzasFiltradas} />
        </div>
    );
}