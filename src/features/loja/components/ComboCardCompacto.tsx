import { Plus } from "lucide-react";
import type { SyntheticEvent } from "react";

import type { ComboResolvido } from "../types/combos";

interface ComboCardCompactoProps {
  combo: ComboResolvido;
  onAdicionar: (combo: ComboResolvido) => void;
}

function formatarMoeda(valor: number): string {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function ComboCardCompacto({
  combo,
  onAdicionar,
}: ComboCardCompactoProps) {
  function usarImagemReserva(event: SyntheticEvent<HTMLImageElement>) {
    event.currentTarget.onerror = null;
    event.currentTarget.src = "/images/banner-pizzaria.jpg";
  }

  return (
    <article className="combo-card-compacto">
      <div className="combo-card-compacto__imagem-wrapper">
        {combo.descontoPercentual > 0 && (
          <span className="combo-card-compacto__selo">
            -{combo.descontoPercentual}% OFF
          </span>
        )}

        <img
          className="combo-card-compacto__imagem"
          alt={combo.nome}
          src={combo.imagem}
          onError={usarImagemReserva}
        />
      </div>

      <div className="combo-card-compacto__conteudo">
        <h3>{combo.nome}</h3>

        {combo.descricao && <p>{combo.descricao}</p>}

        <div className="combo-card-compacto__rodape">
          <strong>{formatarMoeda(combo.precoPromocional)}</strong>

          <button
            type="button"
            className="combo-card-compacto__adicionar"
            onClick={() => onAdicionar(combo)}
            aria-label={`Adicionar ${combo.nome} ao carrinho`}
          >
            <Plus size={18} />
          </button>
        </div>
      </div>
    </article>
  );
}