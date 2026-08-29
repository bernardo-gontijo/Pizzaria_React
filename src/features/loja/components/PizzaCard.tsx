import type { SyntheticEvent } from "react";
import type { Pizza } from "../types/pizza";
import { Link } from "react-router-dom";

interface PizzaCardProps {
  pizza: Pizza;
}

export function PizzaCard({ pizza }: PizzaCardProps) {
  function usarImagemReserva(event: SyntheticEvent<HTMLImageElement>) {
    event.currentTarget.onerror = null;
    event.currentTarget.src = "/images/banner-pizzaria.jpg";
  }

  return (
    <Link
      className="pizza-card__link"
      to={`/pizza/${pizza.id}`}
      arial-label={`Ver detalhes da pizza ${pizza.nome}`}
    >
      <article className="pizza-card">
        <img alt={pizza.nome} src={pizza.imagem} onError={usarImagemReserva} />
        <div className="pizza-card__conteudo">
          <span className="categoria">{pizza.categoria}</span>
          <h2>{pizza.nome}</h2>
          <p>{pizza.descricao}</p>
          <strong>R$ {pizza.preco.toFixed(2).replace(".", ",")}</strong>
        </div>
      </article>
    </Link>
  );
}
