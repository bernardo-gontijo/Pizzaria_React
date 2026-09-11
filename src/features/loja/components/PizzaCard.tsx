import { useEffect, useState } from "react";
import type { SyntheticEvent } from "react";
import type { Pizza } from "../types/pizza";
import { Link } from "react-router-dom";
import { buscarAvaliacoesDaPizza } from "../api/avaliacoes.service";
import { EstrelaMedia } from "./EstrelaMedia";

interface PizzaCardProps {
  pizza: Pizza;
}

export function PizzaCard({ pizza }: PizzaCardProps) {
  const [media, setMedia] = useState(null as number | null);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    buscarAvaliacoesDaPizza(pizza.id)
      .then((dados) => {
        setMedia(dados.media);
        setTotal(dados.total);
      })
      .catch(() => {});
  }, [pizza.id]);

  function usarImagemReserva(event: SyntheticEvent<HTMLImageElement>) {
    event.currentTarget.onerror = null;
    event.currentTarget.src = "/images/banner-pizzaria.jpg";
  }

  return (
    <Link
      className="pizza-card__link"
      to={`/pizza/${pizza.id}`}
      aria-label={`Ver detalhes da pizza ${pizza.nome}`}
    >
      <article className="pizza-card">
        <img alt={pizza.nome} src={pizza.imagem} onError={usarImagemReserva} />
        <div className="pizza-card__conteudo">
          <span className="categoria">{pizza.categoria}</span>
          <h2>{pizza.nome}</h2>
          <p>{pizza.descricao}</p>
          <EstrelaMedia media={media} total={total} compacto />
          <strong>R$ {pizza.preco.toFixed(2).replace(".", ",")}</strong>
        </div>
      </article>
    </Link>
  );
}
