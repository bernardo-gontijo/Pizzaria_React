import { useNavigate } from "react-router-dom";
import { useCart } from "../../../context/CartContext";

interface ResumoCarrinhoProps {
    showCheckoutButton?: boolean;
}

export function ResumoCarrinho({ showCheckoutButton = true }: ResumoCarrinhoProps) {
    const { items, removerItem, alterarQuantidade, subtotal, taxaEntrega, total } = useCart();
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
                    <div className="carrinho-item__descricao">
                        <strong>{item.nome}</strong>
                        <span>R$ {item.precoUnitario.toFixed(2)} cada</span>
                    </div>
                    <div className="carrinho-item__acoes">
                        <button 
                            aria-label={`Diminuir ${item.nome}`}
                            onClick={() => alterarQuantidade(item.id, item.quantidade - 1)} 
                            disabled={item.quantidade <= 1}
                        >
                            -
                        </button>
                        <strong>{item.quantidade}</strong>
                        <button aria-label={`Aumentar ${item.nome}`} onClick={() => alterarQuantidade(item.id, item.quantidade + 1)}>
                            +
                        </button>
                    </div>
                    <strong className="carrinho-item__subtotal">R$ {(item.precoUnitario * item.quantidade).toFixed(2)}</strong>
                    <button className="carrinho-item__remover" aria-label={`Remover ${item.nome}`} onClick={() => removerItem(item.id)}>×</button>
                </div>
            ))}

            <div className="carrinho-total">
                <p><span>Subtotal</span><span>R$ {subtotal.toFixed(2)}</span></p>
                <p><span>Entrega</span><span>R$ {taxaEntrega.toFixed(2)}</span></p>
                <p className="carrinho-total__final"><span>Total</span><span>R$ {total.toFixed(2)}</span></p>
            </div>

            {showCheckoutButton && (
                <button className="carrinho-resumo__finalizar" onClick={() => navigate("/checkout")}>Finalizar pedido</button>
            )}
        </div>
    );
}
