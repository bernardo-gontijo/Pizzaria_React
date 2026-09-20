interface EstrelaMediaProps {
  media: number | null;
  total: number;
  compacto?: boolean;
}

function arredondarParaMeiaEstrela(valor: number): number {
  return Math.round(valor * 2) / 2;
}

export function EstrelaMedia({ media, total, compacto }: EstrelaMediaProps) {
  if (media === null) {
    return compacto ? null : (
      <span className="estrela-media__vazio">Sem avaliações</span>
    );
  }

  const mediaArredondada = arredondarParaMeiaEstrela(media);

  return (
    <span className="estrela-media">
      <span className="estrela-media__estrelas">
        {[1, 2, 3, 4, 5].map((posicao) => {
          const preenchimento =
            mediaArredondada >= posicao
              ? "100%"
              : mediaArredondada >= posicao - 0.5
                ? "50%"
                : "0%";

          return (
            <span key={posicao} className="estrela-visual">
              <span className="estrela-visual__fundo">★</span>
              <span
                className="estrela-visual__preenchida"
                style={{ width: preenchimento }}
              >
                ★
              </span>
            </span>
          );
        })}
      </span>
      <span className="estrela-media__numero">{media.toFixed(1)}</span>
      <span className="estrela-media__total">({total})</span>
    </span>
  );
}
