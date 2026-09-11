interface EstrelaMediaProps {
  media: number | null;
  total: number;
  compacto?: boolean;
}

export function EstrelaMedia({ media, total, compacto }: EstrelaMediaProps) {
  if (media === null) {
    return compacto ? null : <span className="estrela-media__vazio">Sem avaliações</span>;
  }

  return (
    <span className="estrela-media">
      ★ {media.toFixed(1)} <span className="estrela-media__total">({total})</span>
    </span>
  );
}
