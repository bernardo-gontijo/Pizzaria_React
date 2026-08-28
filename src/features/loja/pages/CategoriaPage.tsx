import { Link, useParams } from "react-router-dom";

import { ListaPizzas } from "../components/ListaPizzas";
import { usePizzas } from "../hooks/usePizzas";

export function CategoriaPage() {
  const { categoria } = useParams<{ categoria: string }>();
  const { pizzas, loading, erro } = usePizzas();

  const pizzasFiltradas = pizzas.filter(
    (pizza) => pizza.categoria.toLowerCase() === categoria?.toLowerCase(),
  );

  if (loading) return <p>Carregando...</p>;
  if (erro) return <p>Erro: {erro.message}</p>;

  return (
    <div className="categoria-page">
      <section className="cardapio-banner">
        <h1>{categoria}</h1>
      </section>
      <section className="cardapio-catalogo">
        <Link className="voltar-cardapio" to="/cardapio">
          Todos os sabores
        </Link>
        <ListaPizzas pizzas={pizzasFiltradas} />
      </section>
    </div>
  );
}
