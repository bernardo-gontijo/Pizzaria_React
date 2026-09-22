import { Minus, Plus, Receipt, UtensilsCrossed, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useCart } from "../../../context/CartContext";
import { CupomCarrinho } from "./CupomCarrinho";
import { RecomendacoesCarrinho } from "./RecomendacoesCarrinho";

interface ResumoCarrinhoProps {
  showCheckoutButton?: boolean;
}

function formatarMoeda(valor: number): string {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function ResumoCarrinho({
  showCheckoutButton = true,
}: ResumoCarrinhoProps) {
  const {
    items,
    removerItem,
    alterarQuantidade,
    subtotal,
    taxaEntrega,
    desconto,
    total,
    cupomAplicado,
  } = useCart();

  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="carrinho-vazio">
        <p>Seu carrinho está vazio</p>

        <button onClick={() => navigate("/cardapio")}>Ver cardápio</button>
      </div>
    );
  }

  const quantidadeTotal = items.reduce(
    (total, item) => total + item.quantidade,
    0,
  );

  return (
    <div className="carrinho-conteudo">
      <div className="carrinho-conteudo__topo">
        <div>
          <button
            type="button"
            className="carrinho-conteudo__voltar"
            onClick={() => navigate("/cardapio")}
          >
            ← Adicionar mais itens
          </button>

          <h1>Seu carrinho</h1>
        </div>

        <span className="carrinho-conteudo__contagem">
          {quantidadeTotal}{" "}
          {quantidadeTotal === 1 ? "item selecionado" : "itens selecionados"}
        </span>
      </div>

      <div className="carrinho-tabela">
        <div className="carrinho-tabela__cabecalho">
          <span>Produto</span>
          <span>Quantidade</span>
          <span>Subtotal</span>
          <span aria-hidden="true" />
        </div>

        {items.map((item) => (
          <div key={item.id} className="carrinho-item">
            {item.imagem ? (
              <img
                className="carrinho-item__imagem"
                src={item.imagem}
                alt=""
              />
            ) : (
              <span
                className="carrinho-item__imagem carrinho-item__imagem--vazia"
                aria-hidden="true"
              >
                <UtensilsCrossed size={22} />
              </span>
            )}

            <div className="carrinho-item__descricao">
              <strong>{item.nome}</strong>
              <span>{formatarMoeda(item.precoUnitario)} cada</span>
            </div>

            <div className="carrinho-item__acoes">
              <button
                aria-label={`Diminuir ${item.nome}`}
                onClick={() => alterarQuantidade(item.id, item.quantidade - 1)}
                disabled={item.quantidade <= 1}
              >
                <Minus size={14} />
              </button>

              <strong>{item.quantidade}</strong>

              <button
                aria-label={`Aumentar ${item.nome}`}
                onClick={() => alterarQuantidade(item.id, item.quantidade + 1)}
              >
                <Plus size={14} />
              </button>
            </div>

            <strong className="carrinho-item__subtotal">
              {formatarMoeda(item.precoUnitario * item.quantidade)}
            </strong>

            <button
              className="carrinho-item__remover"
              aria-label={`Remover ${item.nome}`}
              onClick={() => removerItem(item.id)}
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>

      <RecomendacoesCarrinho />

      <CupomCarrinho />

      <div className="carrinho-resumo">
        <h2 className="carrinho-resumo__titulo">Resumo do pedido</h2>

        <div className="carrinho-resumo__linhas">
          <p>
            <span>Subtotal</span>
            <span>{formatarMoeda(subtotal)}</span>
          </p>

          <p>
            <span>Taxa de entrega</span>
            <span>{formatarMoeda(taxaEntrega)}</span>
          </p>

          <p className="carrinho-resumo__desconto">
            <span>Descontos</span>
            <span>
              {cupomAplicado && desconto > 0
                ? `- ${formatarMoeda(desconto)}`
                : formatarMoeda(0)}
            </span>
          </p>
        </div>

        <div className="carrinho-resumo__total">
          <div>
            <span>Total a pagar</span>
            <strong>{formatarMoeda(total)}</strong>
          </div>

          <Receipt size={22} aria-hidden="true" />
        </div>

        {showCheckoutButton && (
          <button
            className="carrinho-resumo__finalizar"
            onClick={() => navigate("/checkout")}
          >
            Finalizar pedido →
          </button>
        )}
      </div>
    </div>
  );
}