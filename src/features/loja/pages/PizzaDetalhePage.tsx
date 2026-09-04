import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCart } from "../../../context/CartContext";
import { buscarPizzaPorId } from "../api/loja.service";
import type { Pizza } from "../types/pizza";

export function PizzaDetalhePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { adicionarItem } = useCart();
  const [pizza, setPizza] = useState<Pizza | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantidade, setQuantidade] = useState(1);

  useEffect(() => {
    async function carregar() {
      try {
        setLoading(true);
        const resultado = await buscarPizzaPorId(id!);
        setPizza(resultado);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    if (id) carregar();
  }, [id]);

  function handleAdicionar() {
    if (!pizza) return;

    adicionarItem({
      id: pizza.id,
      tipo: "pizza",
      nome: pizza.nome,
      precoUnitario: pizza.preco,
      quantidade: quantidade,
      observacoes: "",
    });

    navigate("/carrinho");
  }

  if (loading) return <p>Carregando pizza...</p>;
  if (!pizza) return <p>Pizza não encontrada</p>;

  return (
    <section className="pizza-detalhe-page">
      <img
        className="pizza-detalhe-page__imagem"
        src={pizza.imagem}
        alt={pizza.nome}
      />

      <div className="pizza-detalhe-page__conteudo">
        <span className="categoria">{pizza.categoria}</span>
        <h1>{pizza.nome}</h1>
        <p className="pizza-detalhe-page__descricao">{pizza.descricao}</p>

        <div className="pizza-detalhe-page__ingredientes">
          <strong>Ingredientes</strong>
          <ul>
            {pizza.ingredientes.map((ing, index) => (
              <li key={index}>{ing}</li>
            ))}
          </ul>
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

        <p className="pizza-detalhe-page__preco" aria-live="polite">
          {(pizza.preco * quantidade).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          })}
        </p>
        <button
          className="pizza-detalhe-page__adicionar"
          onClick={handleAdicionar}
          disabled={!pizza.disponivel}
        >
          {pizza.disponivel
            ? "Adicionar ao carrinho"
            : "Indisponível no momento"}
        </button>
      </div>
    </section>
  );
}
