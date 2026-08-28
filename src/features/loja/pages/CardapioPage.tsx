import { Link } from "react-router-dom";

import { ListaPizzas } from "../components/ListaPizzas";
import { usePizzas } from "../hooks/usePizzas";

const categorias = ["tradicional", "especial", "vegetariana", "doce"];

export function CardapioPage() {
  const { pizzas, loading, erro } = usePizzas();

  if (loading) return <p>Carregando cardápio...</p>;
  if (erro) return <p>Erro: {erro.message}</p>;

  return (
    <div className="cardapio-page">
      <section className="cardapio-banner">
        <h1>Cardápio</h1>
      </section>
      <section className="cardapio-catalogo">
        <nav aria-label="Categorias do cardápio" className="categorias-menu">
          <Link to="/cardapio">Todos os sabores</Link>
          {categorias.map((categoria) => (
            <Link key={categoria} to={`/categoria/${categoria}`}>
              {categoria}
            </Link>
          ))}
        </nav>
        <ListaPizzas pizzas={pizzas.filter((pizza) => pizza.disponivel)} />
      </section>
    </div>
  );
}
