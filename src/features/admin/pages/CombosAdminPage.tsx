import { useEffect, useState } from "react";

import type { Combo, ComboResolvido } from "../../loja/types/combos";

import { ComboForm } from "../components/ComboForm";
import { useAdminCombos } from "../hooks/useAdminCombos";

function paraComboEditavel(combo: ComboResolvido): Combo {
  return {
    id: combo.id,
    nome: combo.nome,
    descricao: combo.descricao,
    itens: combo.itens.map((item) => ({
      tipo: item.tipo,
      id: item.id,
      quantidade: item.quantidade,
    })),
    descontoPercentual: combo.descontoPercentual,
    disponivel: combo.disponivel,
  };
}

export function CombosAdminPage() {
  const {
    combos,
    carregando,
    erro,
    carregarCombos,
    adicionarCombo,
    editarCombo,
    excluirCombo,
  } = useAdminCombos();

  const [comboEditando, setComboEditando] = useState<Combo | undefined>(
    undefined,
  );

  useEffect(() => {
    void carregarCombos();
  }, [carregarCombos]);

  function handleSubmit(dados: Parameters<typeof adicionarCombo>[0]) {
    if (comboEditando) {
      editarCombo(comboEditando.id, dados);
      setComboEditando(undefined);
      return;
    }

    adicionarCombo(dados);
  }

  function handleEditar(combo: ComboResolvido) {
    setComboEditando(paraComboEditavel(combo));
  }

  function handleExcluir(id: string) {
    const confirmou = window.confirm(
      "Tem certeza que deseja excluir este combo?",
    );

    if (!confirmou) return;

    excluirCombo(id);

    if (comboEditando?.id === id) {
      setComboEditando(undefined);
    }
  }

  return (
    <main>
      <h1>Gerenciamento de Combos</h1>

      <ComboForm
        key={comboEditando?.id ?? "novo-combo"}
        combo={comboEditando}
        onSubmit={handleSubmit}
        onCancel={() => setComboEditando(undefined)}
      />

      <hr />

      <h2>Combos cadastrados</h2>

      {carregando && <p>Carregando combos...</p>}

      {erro && <p role="alert">{erro}</p>}

      {!carregando && !erro && combos.length === 0 && (
        <p>Nenhum combo cadastrado.</p>
      )}

      {combos.map((combo) => (
        <article key={combo.id}>
          <h3>{combo.nome}</h3>

          {combo.descricao && <p>{combo.descricao}</p>}

          <ul>
            {combo.itens.map((item) => (
              <li key={`${item.tipo}-${item.id}`}>
                {item.quantidade}x {item.nome}
              </li>
            ))}
          </ul>

          <p>
            <strong>Preço original:</strong>{" "}
            {combo.precoOriginal.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          </p>

          <p>
            <strong>Desconto:</strong> {combo.descontoPercentual}%
          </p>

          <p>
            <strong>Preço promocional:</strong>{" "}
            {combo.precoPromocional.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          </p>

          <p>
            <strong>Status:</strong>{" "}
            {combo.disponivel ? "Disponível" : "Indisponível"}
          </p>

          <div>
            <button type="button" onClick={() => handleEditar(combo)}>
              Editar
            </button>

            <button type="button" onClick={() => handleExcluir(combo.id)}>
              Excluir
            </button>
          </div>

          <hr />
        </article>
      ))}
    </main>
  );
}
