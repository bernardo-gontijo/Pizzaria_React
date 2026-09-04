import { useMemo, useState } from "react";
import { Minus, Plus } from "lucide-react";
import { usePizzas } from "../../loja/hooks/usePizzas";
import { useBebidas } from "../../loja/hooks/useBebidas";
import { Loading } from "../../../components/Loading";
import type { ItemPedido } from "../../loja/types/pedido";

interface SeletorItemModalProps {
  onSelecionar: (item: Omit<ItemPedido, "id">) => void | Promise<void>;
  onFechar: () => void;
}

type Aba = "pizza" | "bebida";

const QUANTIDADE_MINIMA = 0;

export function SeletorItemModal({
  onSelecionar,
  onFechar,
}: SeletorItemModalProps) {
  const { pizzas, loading: carregandoPizzas } = usePizzas();
  const { bebidas, loading: carregandoBebidas } = useBebidas();

  const [aba, setAba] = useState<Aba>("pizza");
  const [busca, setBusca] = useState("");
  const [adicionando, setAdicionando] = useState(false);
  const [quantidades, setQuantidades] = useState<Record<string, number>>({});

  const carregando = aba === "pizza" ? carregandoPizzas : carregandoBebidas;

  const pizzasDisponiveis = useMemo(
    () =>
      pizzas
        .filter((pizza) => pizza.disponivel)
        .filter((pizza) =>
          pizza.nome.toLowerCase().includes(busca.toLowerCase()),
        ),
    [pizzas, busca],
  );

  const bebidasDisponiveis = useMemo(
    () =>
      bebidas
        .filter((bebida) => bebida.disponivel)
        .filter((bebida) =>
          bebida.nome.toLowerCase().includes(busca.toLowerCase()),
        ),
    [bebidas, busca],
  );

  function obterQuantidade(id: string) {
    return quantidades[id] ?? QUANTIDADE_MINIMA;
  }

  function alterarQuantidade(id: string, delta: number) {
    setQuantidades((atual) => ({
      ...atual,
      [id]: Math.max(
        QUANTIDADE_MINIMA,
        (atual[id] ?? QUANTIDADE_MINIMA) + delta,
      ),
    }));
  }

  async function concluirSelecao() {
    if (adicionando) return;

    const itensParaAdicionar: Omit<ItemPedido, "id">[] = [];

    // Pega todas as pizzas que possuem quantidade maior que 0.
    pizzasDisponiveis.forEach((pizza) => {
      const quantidade = obterQuantidade(pizza.id);

      if (quantidade > 0) {
        itensParaAdicionar.push({
          tipo: "pizza",
          pizzaId: pizza.id,
          pizzaName: pizza.nome,
          quantity: quantidade,
          price: pizza.preco,
          size: "M",
        });
      }
    });

    // Pega todas as bebidas que possuem quantidade maior que 0.
    bebidasDisponiveis.forEach((bebida) => {
      const quantidade = obterQuantidade(bebida.id);

      if (quantidade > 0) {
        itensParaAdicionar.push({
          tipo: "bebida",
          pizzaId: bebida.id,
          pizzaName: bebida.nome,
          quantity: quantidade,
          price: bebida.preco,
        });
      }
    });

    // Se nenhum item foi selecionado, não faz nada.
    if (itensParaAdicionar.length === 0) {
      return;
    }

    setAdicionando(true);

    try {
      // Adiciona todos os produtos selecionados.
      for (const item of itensParaAdicionar) {
        await onSelecionar(item);
      }

      // Limpa as quantidades depois de adicionar.
      setQuantidades({});

      // Fecha o modal.
      onFechar();
    } finally {
      setAdicionando(false);
    }
  }

  return (
    <div
      className="seletor-item-modal__overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Selecionar item do cardápio"
      onClick={onFechar}
    >
      <div
        className="seletor-item-modal"
        onClick={(evento) => evento.stopPropagation()}
      >
        <div className="seletor-item-modal__cabecalho">
          <h2>Adicionar item</h2>

          <button
            type="button"
            className="seletor-item-modal__fechar"
            onClick={onFechar}
            aria-label="Fechar"
            disabled={adicionando}
          >
            ×
          </button>
        </div>

        <div className="seletor-item-modal__abas">
          <button
            type="button"
            className={
              aba === "pizza"
                ? "seletor-item-modal__aba seletor-item-modal__aba--ativa"
                : "seletor-item-modal__aba"
            }
            onClick={() => setAba("pizza")}
            disabled={adicionando}
          >
            Pizzas
          </button>

          <button
            type="button"
            className={
              aba === "bebida"
                ? "seletor-item-modal__aba seletor-item-modal__aba--ativa"
                : "seletor-item-modal__aba"
            }
            onClick={() => setAba("bebida")}
            disabled={adicionando}
          >
            Bebidas
          </button>
        </div>

        <input
          type="text"
          className="seletor-item-modal__busca"
          placeholder={
            aba === "pizza"
              ? "Buscar pizza..."
              : "Buscar bebida..."
          }
          value={busca}
          onChange={(evento) => setBusca(evento.target.value)}
          disabled={adicionando}
        />

        <div className="seletor-item-modal__lista">
          {carregando && <Loading />}

          {!carregando &&
            aba === "pizza" &&
            pizzasDisponiveis.length === 0 && (
              <p className="feedback">
                Nenhuma pizza encontrada.
              </p>
            )}

          {!carregando &&
            aba === "bebida" &&
            bebidasDisponiveis.length === 0 && (
              <p className="feedback">
                Nenhuma bebida encontrada.
              </p>
            )}

          {!carregando &&
            aba === "pizza" &&
            pizzasDisponiveis.map((pizza) => {
              const quantidade = obterQuantidade(pizza.id);

              return (
                <div
                  key={pizza.id}
                  className="seletor-item-modal__item"
                >
                  <div className="seletor-item-modal__item-info">
                    <span className="seletor-item-modal__item-nome">
                      {pizza.nome}
                    </span>

                    <span className="seletor-item-modal__item-preco">
                      R$ {pizza.preco.toFixed(2)}
                    </span>
                  </div>

                  <div className="seletor-item-modal__item-acoes">
                    <div className="seletor-item-modal__stepper">
                      <button
                        type="button"
                        aria-label={`Diminuir quantidade de ${pizza.nome}`}
                        disabled={
                          adicionando ||
                          quantidade <= QUANTIDADE_MINIMA
                        }
                        onClick={() =>
                          alterarQuantidade(pizza.id, -1)
                        }
                      >
                        <Minus size={14} />
                      </button>

                      <span>{quantidade}</span>

                      <button
                        type="button"
                        aria-label={`Aumentar quantidade de ${pizza.nome}`}
                        disabled={adicionando}
                        onClick={() =>
                          alterarQuantidade(pizza.id, 1)
                        }
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

          {!carregando &&
            aba === "bebida" &&
            bebidasDisponiveis.map((bebida) => {
              const quantidade = obterQuantidade(bebida.id);

              return (
                <div
                  key={bebida.id}
                  className="seletor-item-modal__item"
                >
                  <div className="seletor-item-modal__item-info">
                    <span className="seletor-item-modal__item-nome">
                      {bebida.nome}
                      {bebida.quantidade
                        ? ` (${bebida.quantidade})`
                        : ""}
                    </span>

                    <span className="seletor-item-modal__item-preco">
                      R$ {bebida.preco.toFixed(2)}
                    </span>
                  </div>

                  <div className="seletor-item-modal__item-acoes">
                    <div className="seletor-item-modal__stepper">
                      <button
                        type="button"
                        aria-label={`Diminuir quantidade de ${bebida.nome}`}
                        disabled={
                          adicionando ||
                          quantidade <= QUANTIDADE_MINIMA
                        }
                        onClick={() =>
                          alterarQuantidade(bebida.id, -1)
                        }
                      >
                        <Minus size={14} />
                      </button>

                      <span>{quantidade}</span>

                      <button
                        type="button"
                        aria-label={`Aumentar quantidade de ${bebida.nome}`}
                        disabled={adicionando}
                        onClick={() =>
                          alterarQuantidade(bebida.id, 1)
                        }
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>

        <button
          type="button"
          className="bg-primaria seletor-item-modal__concluir"
          onClick={() => void concluirSelecao()}
          disabled={adicionando}
        >
          {adicionando ? "Adicionando..." : "Concluir"}
        </button>
      </div>
    </div>
  );
}