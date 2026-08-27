import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCart } from "../../../context/CartContext";
import { buscarPizzaPorId } from "../api/loja.service";
import type { Pizza } from "../types/pizza";

export function PizzaDetalhePage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { adicionarItem } = useCart();
    const [pizza, setPizza] = useState<Pizza | null>(null);
    const [loading, setLoading] = useState(true);
    const [quantidade, setQuantidade] = useState(1);

    useEffect(() => {
        async function carregar() {
            try {
                setLoading(true);
                const resultado = await buscarPizzaPorId(id!);
                setPizza(resultado);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        }

        if (id) carregar();
    }, [id]);

    function handleAdicionar() {
        if (!pizza) return;

        adicionarItem({
            id: pizza.id,
            nome: pizza.nome,
            precoUnitario: pizza.preco,
            quantidade: quantidade,
            observacoes: "",
        });

        navigate("/carrinho");
    }

    if (loading) return <p>Carregando pizza...</p>;
    if (!pizza) return <p>Pizza não encontrada</p>;

    return (
        <div className="pizza-detalhe-page">
            <img src={pizza.imagem} alt={pizza.nome} />
            
            <h1>{pizza.nome}</h1>
            <p>{pizza.descricao}</p>
            
            <div>
                <strong>Categoria:</strong> {pizza.categoria}
            </div>
            
            <div>
                <strong>Ingredientes:</strong>
                <ul>
                    {pizza.ingredientes.map((ing, index) => (
                        <li key={index}>{ing}</li>
                    ))}
                </ul>
            </div>

            <div>
                <label>Quantidade:</label>
                <button onClick={() => setQuantidade(Math.max(1, quantidade - 1))}>-</button>
                <span>{quantidade}</span>
                <button onClick={() => setQuantidade(quantidade + 1)}>+</button>
            </div>

            <div>
                <strong>Preço: R$ {pizza.preco.toFixed(2)}</strong>
            </div>

            <button onClick={handleAdicionar} disabled={!pizza.disponivel}>
                Adicionar ao Carrinho
            </button>

            {!pizza.disponivel && <p>Indisponível no momento</p>}
        </div>
    );
}