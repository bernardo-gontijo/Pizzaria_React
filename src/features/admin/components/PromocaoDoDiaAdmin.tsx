import { Flame } from "lucide-react";
import { useState } from "react";

import type { Pizza } from "../../loja/types/pizza";
import {
  definirPromocaoDoDia,
  removerPromocaoDoDia,
} from "../../loja/api/promocao.service";
import { usePromocaoDoDia } from "../../loja/hooks/usePromocaoDoDia";

interface PromocaoDoDiaAdminProps {
  pizzas: Pizza[];
}

function formatarMoeda(valor: number): string {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function PromocaoDoDiaAdmin({ pizzas }: PromocaoDoDiaAdminProps) {
  const { promocao, loading } = usePromocaoDoDia();

  const [pizzaIdSelecionada, setPizzaIdSelecionada] = useState("");
  const [percentual, setPercentual] = useState("15");
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState(null as string | null);

  // Sincroniza o formulario com a promocao salva sempre que ela mudar
  // (ex: em outra aba), mas so enquanto o admin nao estiver editando
  // ativamente um valor diferente. Ajuste feito durante a renderizacao
  // (em vez de useEffect) para evitar um render extra desnecessario.
  const [promocaoSincronizadaId, setPromocaoSincronizadaId] = useState(
    null as string | null,
  );
  const promocaoAtualId = promocao ? promocao.pizza.id : null;

  if (!loading && promocaoAtualId !== promocaoSincronizadaId) {
    setPromocaoSincronizadaId(promocaoAtualId);
    setPizzaIdSelecionada(promocaoAtualId ?? "");
    setPercentual(promocao ? String(promocao.percentualDesconto) : "15");
  }

  async function handleSalvar(evento: React.FormEvent) {
    evento.preventDefault();

    const percentualConvertido = Number(percentual);

    if (!pizzaIdSelecionada) {
      setErro("Escolha uma pizza para ser a promocao do dia.");
      return;
    }

    if (
      Number.isNaN(percentualConvertido) ||
      percentualConvertido <= 0 ||
      percentualConvertido > 100
    ) {
      setErro("Informe um percentual de desconto entre 1 e 100.");
      return;
    }

    try {
      setErro(null);
      setSalvando(true);

      await definirPromocaoDoDia({
        pizzaId: pizzaIdSelecionada,
        percentualDesconto: percentualConvertido,
      });
    } catch {
      setErro("Nao foi possivel salvar a promocao. Tente novamente.");
    } finally {
      setSalvando(false);
    }
  }

  async function handleRemover() {
    try {
      setErro(null);
      setSalvando(true);

      await removerPromocaoDoDia();

      setPizzaIdSelecionada("");
      setPercentual("15");
    } catch {
      setErro("Nao foi possivel remover a promocao. Tente novamente.");
    } finally {
      setSalvando(false);
    }
  }

  const pizzaSelecionadaPreview = pizzas.find(
    (pizza) => pizza.id === pizzaIdSelecionada,
  );

  const precoComDescontoPreview =
    pizzaSelecionadaPreview && !Number.isNaN(Number(percentual))
      ? pizzaSelecionadaPreview.preco *
        (1 - Math.min(100, Math.max(0, Number(percentual))) / 100)
      : null;

  return (
    <section className="promocao-dia-admin">
      <h2 className="promocao-dia-admin__titulo">
        <Flame size={18} aria-hidden="true" />
        Pizza promocional do dia
      </h2>

      <p className="promocao-dia-admin__descricao">
        Escolha uma pizza do cardapio para destacar como promocao do dia e
        defina o percentual de desconto aplicado sobre o preco dela.
      </p>

      {loading ? (
        <p>Carregando promocao atual...</p>
      ) : (
        <form onSubmit={handleSalvar} className="promocao-dia-admin__form">
          <div>
            <label htmlFor="promocao-pizza">Pizza</label>

            <select
              id="promocao-pizza"
              value={pizzaIdSelecionada}
              onChange={(evento) => setPizzaIdSelecionada(evento.target.value)}
            >
              <option value="">Nenhuma promocao ativa</option>

              {pizzas.map((pizza) => (
                <option key={pizza.id} value={pizza.id}>
                  {pizza.nome} - {formatarMoeda(pizza.preco)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="promocao-percentual">Desconto (%)</label>

            <input
              id="promocao-percentual"
              type="number"
              min="1"
              max="100"
              value={percentual}
              onChange={(evento) => setPercentual(evento.target.value)}
            />
          </div>

          {pizzaSelecionadaPreview && precoComDescontoPreview !== null && (
            <p className="promocao-dia-admin__preview">
              Preco promocional:{" "}
              <strong>{formatarMoeda(precoComDescontoPreview)}</strong>{" "}
              <span className="promocao-dia-admin__preco-original">
                {formatarMoeda(pizzaSelecionadaPreview.preco)}
              </span>
            </p>
          )}

          {erro && (
            <p className="promocao-dia-admin__erro" role="alert">
              {erro}
            </p>
          )}

          <div className="promocao-dia-admin__acoes">
            <button type="submit" disabled={salvando}>
              {salvando ? "Salvando..." : "Salvar promocao"}
            </button>

            {promocao && (
              <button
                type="button"
                onClick={handleRemover}
                disabled={salvando}
                className="promocao-dia-admin__remover"
              >
                Remover promocao
              </button>
            )}
          </div>
        </form>
      )}
    </section>
  );
}
