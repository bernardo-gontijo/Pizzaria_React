import type { Pizza } from "../types/pizza";
import { Link } from "react-router-dom";

interface PizzaCardProps {
  pizza: Pizza;
}

export function PizzaCard({ pizza }: PizzaCardProps) {
  return (
    <article className="pizza-card">
      <img alt={pizza.nome} src={pizza.imagem} />
      <div className="pizza-card__conteudo">
        <span className="categoria">{pizza.categoria}</span>
        <h2>{pizza.nome}</h2>
        <p>{pizza.descricao}</p>
        <strong>R$ {pizza.preco.toFixed(2).replace(".", ",")}</strong>
        <Link className="pizza-card__link" to={`/pizza/${pizza.id}`}>
          Ver detalhes
        </Link>
      </div>
    </article>
  );
}
