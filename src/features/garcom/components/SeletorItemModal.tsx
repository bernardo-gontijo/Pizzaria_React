import { useMemo, useState } from "react";
import { usePizzas } from "../../loja/hooks/usePizzas";
import { useBebidas } from "../../loja/hooks/useBebidas";
import { Loading } from "../../../components/Loading";
import type { ItemPedido } from "../../loja/types/pedido";

interface SeletorItemModalProps {
  onSelecionar: (item: Omit<ItemPedido, "id">) => void | Promise<void>;
  onFechar: () => void;
}

type Aba = "pizza" | "bebida";

export function SeletorItemModal({
  onSelecionar,
  onFechar,
}: SeletorItemModalProps) {
  const { pizzas, loading: carregandoPizzas } = usePizzas();
  const { bebidas, loading: carregandoBebidas } = useBebidas();

  const [aba, setAba] = useState<Aba>("pizza");
  const [busca, setBusca] = useState("");
  const [adicionandoId, setAdicionandoId] = useState<string | null>(null);

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

  async function aoSelecionarPizza(pizza: (typeof pizzas)[number]) {
    setAdicionandoId(pizza.id);
    try {
      await onSelecionar({
        tipo: "pizza",
        pizzaId: pizza.id,
        pizzaName: pizza.nome,
        quantity: 1,
        price: pizza.preco,
        size: "M",
      });
    } finally {
      setAdicionandoId(null);
    }
  }

  async function aoSelecionarBebida(bebida: (typeof bebidas)[number]) {
    setAdicionandoId(bebida.id);
    try {
      await onSelecionar({
        tipo: "bebida",
        pizzaId: bebida.id,
        pizzaName: bebida.nome,
        quantity: 1,
        price: bebida.preco,
      });
    } finally {
      setAdicionandoId(null);
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
          >
            Bebidas
          </button>
        </div>

        <input
          type="text"
          className="seletor-item-modal__busca"
          placeholder={
            aba === "pizza" ? "Buscar pizza..." : "Buscar bebida..."
          }
          value={busca}
          onChange={(evento) => setBusca(evento.target.value)}
        />

        <div className="seletor-item-modal__lista">
          {carregando && <Loading />}

          {!carregando && aba === "pizza" && pizzasDisponiveis.length === 0 && (
            <p className="feedback">Nenhuma pizza encontrada.</p>
          )}

          {!carregando && aba === "bebida" && bebidasDisponiveis.length === 0 && (
            <p className="feedback">Nenhuma bebida encontrada.</p>
          )}

          {!carregando &&
            aba === "pizza" &&
            pizzasDisponiveis.map((pizza) => (
              <button
                type="button"
                key={pizza.id}
                className="seletor-item-modal__item"
                disabled={adicionandoId === pizza.id}
                onClick={() => void aoSelecionarPizza(pizza)}
              >
                <span className="seletor-item-modal__item-nome">
                  {pizza.nome}
                </span>
                <span className="seletor-item-modal__item-preco">
                  R$ {pizza.preco.toFixed(2)}
                </span>
              </button>
            ))}

          {!carregando &&
            aba === "bebida" &&
            bebidasDisponiveis.map((bebida) => (
              <button
                type="button"
                key={bebida.id}
                className="seletor-item-modal__item"
                disabled={adicionandoId === bebida.id}
                onClick={() => void aoSelecionarBebida(bebida)}
              >
                <span className="seletor-item-modal__item-nome">
                  {bebida.nome}
                  {bebida.quantidade ? ` (${bebida.quantidade})` : ""}
                </span>
                <span className="seletor-item-modal__item-preco">
                  R$ {bebida.preco.toFixed(2)}
                </span>
              </button>
            ))}
        </div>

        <button
          type="button"
          className="bg-primaria seletor-item-modal__concluir"
          onClick={onFechar}
        >
          Concluir
        </button>
      </div>
    </div>
  );
}