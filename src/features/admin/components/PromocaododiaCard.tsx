import { Flame } from "lucide-react";
import { Link } from "react-router-dom";

import { usePromocaoDoDia } from "../../loja/hooks/usePromocaoDoDia";

function formatarMoeda(valor: number): string {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function PromocaoDoDiaCard() {
  const { promocao, loading } = usePromocaoDoDia();

  if (loading) return null;

  if (!promocao) {
    return (
      <article className="promocao-dia-card promocao-dia-card--vazio">
        <Flame size={20} aria-hidden="true" />

        <div>
          <h2>Nenhuma promoção ativa</h2>
          <p>Escolha uma pizza do cardápio para destacar como a do dia.</p>
        </div>

        <Link to="/admin/pizzas" className="promocao-dia-card__link">
          Configurar
        </Link>
      </article>
    );
  }

  return (
    <article className="promocao-dia-card">
      <img
        src={promocao.pizza.imagem}
        alt={promocao.pizza.nome}
        className="promocao-dia-card__imagem"
      />

      <div className="promocao-dia-card__conteudo">
        <span className="promocao-dia-card__rotulo">
          <Flame size={14} aria-hidden="true" />
          Pizza do dia
        </span>

        <h2>{promocao.pizza.nome}</h2>

        <p className="promocao-dia-card__precos">
          <span className="promocao-dia-card__preco-original">
            {formatarMoeda(promocao.pizza.preco)}
          </span>
          <strong>{formatarMoeda(promocao.precoComDesconto)}</strong>
          <span className="promocao-dia-card__badge">
            -{promocao.percentualDesconto}%
          </span>
        </p>
      </div>

      <Link to="/admin/pizzas" className="promocao-dia-card__link">
        Editar
      </Link>
    </article>
  );
}