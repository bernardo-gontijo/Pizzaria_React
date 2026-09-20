import { useEffect, useState } from "react";

import {
  buscarAvaliacoesDoPedido,
  criarAvaliacao,
} from "../api/avaliacoes.service";
import type { ItemPedido } from "../types/pedido";

interface AvaliarPedidoProps {
  pedidoId: number;
  itens: ItemPedido[];
}

interface FormularioPorItem {
  nota: number;
  comentario: string;
  enviando: boolean;
  erro: string | null;
}

const FORMULARIO_PADRAO: FormularioPorItem = {
  nota: 0,
  comentario: "",
  enviando: false,
  erro: null,
};

const POSICOES_ESTRELA = [1, 2, 3, 4, 5];

interface SeletorEstrelasProps {
  valor: number;
  aoEscolher: (novoValor: number) => void;
}

function SeletorEstrelas({ valor, aoEscolher }: SeletorEstrelasProps) {
  const [hover, setHover] = useState(null as number | null);

  const valorExibido = hover ?? valor;

  return (
    <div
      className="seletor-estrelas"
      role="radiogroup"
      aria-label="Nota de 0.5 a 5 estrelas"
      onMouseLeave={() => setHover(null)}
    >
      {POSICOES_ESTRELA.map((posicao) => {
        const preenchimento =
          valorExibido >= posicao
            ? "100%"
            : valorExibido >= posicao - 0.5
              ? "50%"
              : "0%";

        return (
          <span key={posicao} className="seletor-estrelas__item">
            <span className="estrela-visual">
              <span className="estrela-visual__fundo">★</span>
              <span
                className="estrela-visual__preenchida"
                style={{ width: preenchimento }}
              >
                ★
              </span>
            </span>

            <button
              type="button"
              className="seletor-estrelas__metade seletor-estrelas__metade--esquerda"
              aria-label={`${posicao - 0.5} estrelas`}
              onMouseEnter={() => setHover(posicao - 0.5)}
              onClick={() => aoEscolher(posicao - 0.5)}
            />
            <button
              type="button"
              className="seletor-estrelas__metade seletor-estrelas__metade--direita"
              aria-label={`${posicao} estrelas`}
              onMouseEnter={() => setHover(posicao)}
              onClick={() => aoEscolher(posicao)}
            />
          </span>
        );
      })}

      <span className="seletor-estrelas__valor">
        {valor > 0 ? `${valor.toFixed(1)} ★` : "Escolha uma nota"}
      </span>
    </div>
  );
}

export function AvaliarPedido({ pedidoId, itens }: AvaliarPedidoProps) {
  const [pizzaIdsAvaliadas, setPizzaIdsAvaliadas] = useState(new Set() as Set<string>);
  const [carregando, setCarregando] = useState(true);
  const [formularios, setFormularios] = useState({} as Record<string, FormularioPorItem>);

  const itensDePizza = itens.filter(
    (item) => item.tipo === undefined || item.tipo === "pizza",
  );

  const pizzaIdsUnicas = Array.from(
    new Map(itensDePizza.map((item) => [item.pizzaId, item])).values(),
  );

  useEffect(() => {
    async function carregar() {
      try {
        setCarregando(true);
        const avaliacoes = await buscarAvaliacoesDoPedido(pedidoId);
        setPizzaIdsAvaliadas(new Set(avaliacoes.map((a) => a.pizzaId)));
      } catch {
        // Se falhar ao buscar, seguimos mostrando o formulário normalmente.
      } finally {
        setCarregando(false);
      }
    }

    void carregar();
  }, [pedidoId]);

  function atualizarFormulario(
    pizzaId: string,
    dados: Partial<FormularioPorItem>,
  ) {
    setFormularios((atual) => ({
      ...atual,
      [pizzaId]: {
        ...(atual[pizzaId] ?? FORMULARIO_PADRAO),
        ...dados,
      },
    }));
  }

  async function enviarAvaliacao(pizzaId: string) {
    const formulario = formularios[pizzaId];

    if (!formulario || formulario.nota < 0.5) {
      atualizarFormulario(pizzaId, { erro: "Escolha de meia a 5 estrelas" });
      return;
    }

    try {
      atualizarFormulario(pizzaId, { enviando: true, erro: null });

      await criarAvaliacao({
        pedidoId,
        pizzaId,
        nota: formulario.nota,
        comentario: formulario.comentario || undefined,
      });

      setPizzaIdsAvaliadas((atual) => new Set(atual).add(pizzaId));
    } catch (error) {
      atualizarFormulario(pizzaId, {
        enviando: false,
        erro:
          error instanceof Error
            ? error.message
            : "Não foi possível enviar sua avaliação",
      });
    }
  }

  if (carregando || pizzaIdsUnicas.length === 0) {
    return null;
  }

  return (
    <div className="avaliar-pedido">
      <h2 className="avaliar-pedido__titulo">Avalie seu pedido</h2>

      <div className="avaliar-pedido__lista">
        {pizzaIdsUnicas.map((item) => {
          const jaAvaliada = pizzaIdsAvaliadas.has(item.pizzaId);
          const formulario = formularios[item.pizzaId] ?? FORMULARIO_PADRAO;

          if (jaAvaliada) {
            return (
              <div
                key={item.pizzaId}
                className="avaliar-pedido__item avaliar-pedido__item--feito"
              >
                <strong>{item.pizzaName}</strong>
                <span>Obrigado pela sua avaliação! 🍕</span>
              </div>
            );
          }

          return (
            <div key={item.pizzaId} className="avaliar-pedido__item">
              <strong>{item.pizzaName}</strong>

              <SeletorEstrelas
                valor={formulario.nota}
                aoEscolher={(novoValor) =>
                  atualizarFormulario(item.pizzaId, {
                    nota: novoValor,
                    erro: null,
                  })
                }
              />

              <textarea
                className="avaliar-pedido__comentario"
                placeholder="Comentário (opcional)"
                value={formulario.comentario}
                onChange={(e) =>
                  atualizarFormulario(item.pizzaId, {
                    comentario: e.target.value,
                  })
                }
              />

              {formulario.erro && (
                <p className="feedback feedback--erro">{formulario.erro}</p>
              )}

              <button
                type="button"
                className="botao"
                disabled={formulario.enviando}
                onClick={() => void enviarAvaliacao(item.pizzaId)}
              >
                {formulario.enviando ? "Enviando..." : "Enviar avaliação"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
