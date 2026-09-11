import { useEffect, useState } from "react";

import {
  buscarAvaliacoesDaPizza,
  type AvaliacoesDaPizza,
} from "../api/avaliacoes.service";
import { EstrelaMedia } from "./EstrelaMedia";

interface AvaliacoesPizzaProps {
  pizzaId: string;
}

export function AvaliacoesPizza({ pizzaId }: AvaliacoesPizzaProps) {
  const [dados, setDados] = useState(null as AvaliacoesDaPizza | null);

  useEffect(() => {
    buscarAvaliacoesDaPizza(pizzaId)
      .then(setDados)
      .catch(() => {});
  }, [pizzaId]);

  if (!dados) return null;

  return (
    <div className="avaliacoes-pizza">
      <h2 className="avaliacoes-pizza__titulo">Avaliações</h2>
      <EstrelaMedia media={dados.media} total={dados.total} />

      <ul className="avaliacoes-pizza__lista">
        {dados.avaliacoes.map((avaliacao) => (
          <li key={avaliacao.id} className="avaliacoes-pizza__item">
            <strong>{"★".repeat(avaliacao.nota)}</strong>
            {avaliacao.comentario && <p>{avaliacao.comentario}</p>}
            {avaliacao.clienteNome && (
              <span className="avaliacoes-pizza__autor">
                {avaliacao.clienteNome}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
