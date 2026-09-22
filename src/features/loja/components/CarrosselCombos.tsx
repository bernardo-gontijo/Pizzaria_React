import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";

import type { ComboResolvido } from "../types/combos";
import { ComboCardCompacto } from "./ComboCardCompacto";

interface CarrosselCombosProps {
  combos: readonly ComboResolvido[];
  onAdicionar: (combo: ComboResolvido) => void;
}

// Distância aproximada de um "passo" do carrossel: a largura de um
// card compacto (ver .combo-card-compacto no CSS) mais o espaçamento
// entre cards. Não precisa ser exata — o objetivo é rolar o
// equivalente a um card por clique, não alinhar com precisão de
// pixel.
const LARGURA_PASSO_PX = 320;

export function CarrosselCombos({
  combos,
  onAdicionar,
}: CarrosselCombosProps) {
  const trilhoRef = useRef<HTMLDivElement>(null);

  function rolar(direcao: "esquerda" | "direita") {
    const trilho = trilhoRef.current;

    if (!trilho) return;

    trilho.scrollBy({
      left: direcao === "direita" ? LARGURA_PASSO_PX : -LARGURA_PASSO_PX,
      behavior: "smooth",
    });
  }

  if (combos.length === 0) return null;

  return (
    <section className="carrossel-combos" aria-label="Nossos combos">
      <div className="carrossel-combos__cabecalho">
        <h2 className="carrossel-combos__titulo">Nossos Combos</h2>

        <div className="carrossel-combos__setas">
          <button
            type="button"
            onClick={() => rolar("esquerda")}
            aria-label="Ver combos anteriores"
          >
            <ChevronLeft size={18} />
          </button>

          <button
            type="button"
            onClick={() => rolar("direita")}
            aria-label="Ver mais combos"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div className="carrossel-combos__trilho" ref={trilhoRef}>
        {combos.map((combo) => (
          <div key={combo.id} className="carrossel-combos__item">
            <ComboCardCompacto combo={combo} onAdicionar={onAdicionar} />
          </div>
        ))}
      </div>
    </section>
  );
}