import type { SyntheticEvent } from "react";

import type { Combo } from "../types/combos";

interface ComboCardProps {
  combo: Combo;
  onAdicionar: (combo: Combo) => void;
}

export function ComboCard({ combo, onAdicionar }: ComboCardProps) {
  function usarImagemReserva(event: SyntheticEvent<HTMLImageElement>) {
    event.currentTarget.onerror = null;
    event.currentTarget.src = "/images/banner-pizzaria.jpg";
  }

  const percentualDesconto = Math.round(
    ((combo.precoOriginal - combo.precoPromocional) / combo.precoOriginal) *
      100,
  );

  return (
    <article className="combo-card">
      <span className="combo-card__selo">-{percentualDesconto}%</span>

      <img
        className="combo-card__imagem"
        alt={combo.nome}
        src={combo.imagem}
        onError={usarImagemReserva}
      />

      <div className="combo-card__conteudo">
        <h2>{combo.nome}</h2>
        <p>{combo.descricao}</p>

        <ul className="combo-card__itens">
          {combo.itensIncluidos.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>

        <div className="combo-card__precos">
          <span className="combo-card__preco-original">
            R$ {combo.precoOriginal.toFixed(2).replace(".", ",")}
          </span>
          <strong className="combo-card__preco-promocional">
            R$ {combo.precoPromocional.toFixed(2).replace(".", ",")}
          </strong>
        </div>

        <button
          type="button"
          className="combo-card__botao"
          onClick={() => onAdicionar(combo)}
        >
          Adicionar combo
        </button>
      </div>
    </article>
  );
}