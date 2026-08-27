import { useNavigate } from "react-router-dom";
import { useCart } from "../../../context/CartContext";

interface ResumoCarrinhoProps {
    showCheckoutButton?: boolean;
}

export function ResumoCarrinho({ showCheckoutButton = true }: ResumoCarrinhoProps) {
    const { items, removerItem, alterarQuantidade, total } = useCart();
    const navigate = useNavigate();

    if (items.length === 0) {
        return (
            <div className="carrinho-vazio">
                <p>Seu carrinho está vazio</p>
                <button onClick={() => navigate("/cardapio")}>Ver cardápio</button>
            </div>
        );
    }

    return (
        <div className="carrinho-resumo">
            {items.map((item: any) => (
                <div key={item.id} className="carrinho-item">
                    <span>{item.nome}</span>
                    <span>R$ {item.precoUnitario.toFixed(2)}</span>
                    <div>
                        <button 
                            onClick={() => alterarQuantidade(item.id, item.quantidade - 1)} 
                            disabled={item.quantidade <= 1}
                        >
                            -
                        </button>
                        <span>{item.quantidade}</span>
                        <button onClick={() => alterarQuantidade(item.id, item.quantidade + 1)}>
                            +
                        </button>
                    </div>
                    <button onClick={() => removerItem(item.id)}>✕</button>
                </div>
            ))}

            <div className="carrinho-total">
                <span>Total: R$ {total.toFixed(2)}</span>
            </div>

            {showCheckoutButton && (
                <button onClick={() => navigate("/checkout")}>Finalizar Pedido</button>
            )}
        </div>
    );
}