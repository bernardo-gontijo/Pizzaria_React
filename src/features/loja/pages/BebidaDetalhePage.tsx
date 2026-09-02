import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { useCart } from "../../../context/CartContext";
import { buscarBebidaPorId } from "../api/bebidas.service";
import type { Bebida } from "../types/bebidas";

export function BebidaDetalhePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { adicionarItem } = useCart();
  const [bebida, setBebida] = useState<Bebida | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [quantidade, setQuantidade] = useState(1);

  useEffect(() => {
    async function carregar() {
      try {
        setLoading(true);
        setErro(null);
        setBebida(await buscarBebidaPorId(id!));
      } catch (error) {
        setErro(
          error instanceof Error
            ? error.message
            : "Não foi possível carregar a bebida.",
        );
      } finally {
        setLoading(false);
      }
    }

    if (id) void carregar();
  }, [id]);

  function handleAdicionar() {
    if (!bebida) return;

    adicionarItem({
      id: bebida.id,
      tipo: "bebida",
      nome: bebida.nome,
      precoUnitario: bebida.preco,
      quantidade,
    });

    navigate("/carrinho");
  }

  if (loading) return <p className="feedback">Carregando bebida...</p>;
  if (erro) return <p className="feedback feedback--erro">Erro: {erro}</p>;
  if (!bebida)
    return <p className="feedback feedback--erro">Bebida não encontrada.</p>;

  return (
    <section className="pizza-detalhe-page">
      <img
        className="pizza-detalhe-page__imagem"
        src={bebida.imagem}
        alt={bebida.nome}
      />

      <div className="pizza-detalhe-page__conteudo">
        <span className="categoria">{bebida.categoria}</span>
        <h1>{bebida.nome}</h1>
        <p className="pizza-detalhe-page__descricao">{bebida.descricao}</p>

        <div className="produto-detalhe__medida">
          <strong>Conteúdo</strong>
          <span>{bebida.quantidade}</span>
        </div>

        <div className="seletor-quantidade">
          <span>Quantidade</span>
          <div>
            <button
              aria-label="Diminuir quantidade"
              onClick={() => setQuantidade(Math.max(1, quantidade - 1))}
            >
              −
            </button>
            <strong>{quantidade}</strong>
            <button
              aria-label="Aumentar quantidade"
              onClick={() => setQuantidade(quantidade + 1)}
            >
              +
            </button>
          </div>
        </div>

        <p className="pizza-detalhe-page__preco">
          R$ {bebida.preco.toFixed(2)}
        </p>
        <button
          className="pizza-detalhe-page__adicionar"
          onClick={handleAdicionar}
          disabled={!bebida.disponivel}
        >
          {bebida.disponivel
            ? "Adicionar ao carrinho"
            : "Indisponível no momento"}
        </button>
      </div>
    </section>
  );
}
