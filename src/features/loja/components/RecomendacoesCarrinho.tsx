import { Plus } from "lucide-react";
import { useEffect, useState } from "react";

import { buscarPizzas } from "../api/loja.service";
import { buscarBebidas } from "../api/bebidas.service";
import { useCart } from "../../../context/CartContext";
import type { Pizza } from "../types/pizza";
import type { Bebida } from "../types/bebidas";

const QUANTIDADE_RECOMENDACOES = 2;

type Recomendacao =
  | { tipo: "pizza"; item: Pizza }
  | { tipo: "bebida"; item: Bebida };

function formatarMoeda(valor: number): string {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function RecomendacoesCarrinho() {
  const { items, adicionarItem } = useCart();

  const [recomendacoes, setRecomendacoes] = useState<Recomendacao[]>([]);
  const [carregando, setCarregando] = useState(false);

  const temPizzaOuCombo = items.some(
    (item) => item.tipo === "pizza" || item.tipo === "combo",
  );
  const temBebida = items.some((item) => item.tipo === "bebida");

  const idsNoCarrinho = new Set(items.map((item) => item.id));

  useEffect(() => {
    let cancelado = false;

    async function carregar() {
      // Só recomenda quando o carrinho é "puro": só comida ou só bebida.
      // Se já tem os dois tipos, não há recomendação óbvia a fazer.
      if (temPizzaOuCombo === temBebida) {
        setRecomendacoes([]);
        return;
      }

      try {
        setCarregando(true);

        if (temPizzaOuCombo && !temBebida) {
          const bebidas = await buscarBebidas();

          const disponiveis = bebidas
            .filter((bebida) => bebida.disponivel)
            .filter((bebida) => !idsNoCarrinho.has(bebida.id))
            .slice(0, QUANTIDADE_RECOMENDACOES);

          if (!cancelado) {
            setRecomendacoes(
              disponiveis.map((item) => ({ tipo: "bebida", item }) as const),
            );
          }
        } else {
          const pizzas = await buscarPizzas();

          const disponiveis = pizzas
            .filter((pizza) => pizza.disponivel)
            .filter((pizza) => !idsNoCarrinho.has(pizza.id))
            .slice(0, QUANTIDADE_RECOMENDACOES);

          if (!cancelado) {
            setRecomendacoes(
              disponiveis.map((item) => ({ tipo: "pizza", item }) as const),
            );
          }
        }
      } catch {
        if (!cancelado) {
          setRecomendacoes([]);
        }
      } finally {
        if (!cancelado) {
          setCarregando(false);
        }
      }
    }

    void carregar();

    return () => {
      cancelado = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [temPizzaOuCombo, temBebida, items.length]);

  if (carregando || recomendacoes.length === 0) {
    return null;
  }

  return (
    <section className="recomendacoes-carrinho" aria-label="Peça também">
      <h2 className="recomendacoes-carrinho__titulo">Peça também</h2>

      <div className="recomendacoes-carrinho__grade">
        {recomendacoes.map((recomendacao) => (
          <article
            key={recomendacao.item.id}
            className="recomendacao-card"
          >
            <img
              className="recomendacao-card__imagem"
              src={recomendacao.item.imagem}
              alt={recomendacao.item.nome}
            />

            <div className="recomendacao-card__conteudo">
              <strong>{recomendacao.item.nome}</strong>
              <span>{formatarMoeda(recomendacao.item.preco)}</span>

              <button
                type="button"
                className="recomendacao-card__adicionar"
                onClick={() =>
                  adicionarItem({
                    id: recomendacao.item.id,
                    tipo: recomendacao.tipo,
                    pizza:
                      recomendacao.tipo === "pizza"
                        ? recomendacao.item
                        : undefined,
                    nome: recomendacao.item.nome,
                    imagem: recomendacao.item.imagem,
                    precoUnitario: recomendacao.item.preco,
                    quantidade: 1,
                  })
                }
              >
                <Plus size={14} />
                Adicionar
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}