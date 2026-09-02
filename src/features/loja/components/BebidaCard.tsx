import type { SyntheticEvent } from "react";
import { Link } from "react-router-dom";

import type { Bebida } from "../types/bebidas";

interface BebidaCardProps {
  bebida: Bebida;
}

export function BebidaCard({ bebida }: BebidaCardProps) {
  function usarImagemReserva(event: SyntheticEvent<HTMLImageElement>) {
    event.currentTarget.onerror = null;
    event.currentTarget.src = "/images/banner-pizzaria.jpg";
  }

  return (
    <Link
      className="pizza-card__link"
      to={`/bebida/${bebida.id}`}
      aria-label={`Ver detalhes da bebida ${bebida.nome}`}
    >
      <article className="pizza-card">
        <img
            className="bebida-card__imagem"
            alt={bebida.nome}
            src={bebida.imagem}
            onError={usarImagemReserva}
        />
        <div className="pizza-card__conteudo">
          <span className="categoria">{bebida.categoria}</span>
          <h2>{bebida.nome}</h2>
          <p>{bebida.descricao}</p>
          <small className="produto-medida">{bebida.quantidade}</small>
          <strong>R$ {bebida.preco.toFixed(2).replace(".", ",")}</strong>
        </div>
      </article>
    </Link>
  );
}
