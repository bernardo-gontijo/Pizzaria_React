import { useEffect, useState } from "react";

import type { Bebida } from "../../loja/types/bebidas";

import { BebidaForm, type BebidaFormData } from "../components/BebidaForm";

import { useAdminBebidas } from "../hooks/useAdminBebidas";

export function BebidasPage() {
  const {
    bebidas,
    carregando,
    erro,
    carregarBebidas,
    adicionarBebida,
    editarBebida,
    excluirBebida,
  } = useAdminBebidas();

  const [bebidaEditando, setBebidaEditando] = useState<Bebida | undefined>(
    undefined,
  );

  useEffect(() => {
    void carregarBebidas();
  }, [carregarBebidas]);

  function handleSubmit(dados: BebidaFormData) {
    if (bebidaEditando) {
      editarBebida(bebidaEditando.id, dados);

      setBebidaEditando(undefined);

      return;
    }

    adicionarBebida(dados);
  }

  function handleEditar(bebida: Bebida) {
    setBebidaEditando(bebida);
  }

  function handleExcluir(id: string) {
    const confirmou = window.confirm(
      "Tem certeza que deseja excluir esta bebida?",
    );

    if (!confirmou) {
      return;
    }

    excluirBebida(id);

    if (bebidaEditando?.id === id) {
      setBebidaEditando(undefined);
    }
  }

  return (
    <main>
      <h1>Gerenciamento de Bebidas</h1>

      <BebidaForm
        key={bebidaEditando?.id ?? "nova-bebida"}
        bebida={bebidaEditando}
        onSubmit={handleSubmit}
        onCancel={() => setBebidaEditando(undefined)}
      />

      <hr />

      <h2>Cardápio</h2>

      {carregando && <p>Carregando bebidas...</p>}

      {erro && <p role="alert">{erro}</p>}

      {!carregando && !erro && bebidas.length === 0 && (
        <p>Nenhuma bebida cadastrada.</p>
      )}

      {bebidas.map((bebida) => (
        <article key={bebida.id}>
          <h3>{bebida.nome}</h3>

          <p>{bebida.descricao}</p>

          <p>
            <strong>Preço:</strong>{" "}
            {bebida.preco.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          </p>

          <p>
            <strong>Quantidade:</strong> {bebida.quantidade}
          </p>

          <p>
            <strong>Categoria:</strong> {bebida.categoria}
          </p>

          <p>
            <strong>Status:</strong>{" "}
            {bebida.disponivel ? "Disponível" : "Indisponível"}
          </p>

          {bebida.imagem && (
            <img
              src={bebida.imagem}
              alt={`Bebida ${bebida.nome}`}
              width="200"
            />
          )}

          <div>
            <button type="button" onClick={() => handleEditar(bebida)}>
              Editar
            </button>

            <button type="button" onClick={() => handleExcluir(bebida.id)}>
              Excluir
            </button>
          </div>

          <hr />
        </article>
      ))}
    </main>
  );
}