import { Link, useNavigate } from "react-router-dom";

import { ListaPizzas } from "../components/ListaPizzas";
import { ComboCard } from "../components/ComboCard";
import { usePizzas } from "../hooks/usePizzas";
import { useCombos } from "../hooks/useCombos";
import { useCart } from "../../../context/CartContext";
import type { Combo } from "../types/combos";

const categorias = ["tradicional", "especial", "vegetariana", "doce"];

export function CardapioPage() {
  const { pizzas, loading, erro } = usePizzas();
  const { combos, loading: carregandoCombos } = useCombos();
  const { adicionarItem } = useCart();
  const navigate = useNavigate();

  function handleAdicionarCombo(combo: Combo) {
    adicionarItem({
      id: combo.id,
      tipo: "combo",
      nome: combo.nome,
      precoUnitario: combo.precoPromocional,
      quantidade: 1,
    });

    navigate("/carrinho");
  }

  if (loading) return <p>Carregando cardápio...</p>;
  if (erro) return <p>Erro: {erro.message}</p>;

  const combosDisponiveis = combos.filter((combo) => combo.disponivel);

  return (
    <div className="cardapio-page">
      <section className="cardapio-banner">
        <h1>Cardápio</h1>
      </section>

      {!carregandoCombos && combosDisponiveis.length > 0 && (
        <section className="combos-secao">
          <h2>Combos e Promoções</h2>
          <div className="combos-grade">
            {combosDisponiveis.map((combo) => (
              <ComboCard
                key={combo.id}
                combo={combo}
                onAdicionar={handleAdicionarCombo}
              />
            ))}
          </div>
        </section>
      )}

      <section className="cardapio-catalogo">
        <nav aria-label="Categorias do cardápio" className="categorias-menu">
          <Link to="/cardapio">Todos os sabores</Link>
          {categorias.map((categoria) => (
            <Link key={categoria} to={`/categoria/${categoria}`}>
              {categoria}
            </Link>
          ))}
          <Link to="/bebidas">Bebidas</Link>
        </nav>
        <ListaPizzas pizzas={pizzas.filter((pizza) => pizza.disponivel)} />
      </section>
    </div>
  );
}