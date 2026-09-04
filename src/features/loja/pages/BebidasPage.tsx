import { Link } from "react-router-dom";

import { ListaBebidas } from "../components/ListaBebidas";
import { useBebidas } from "../hooks/useBebidas";

const categorias = ["tradicional", "especial", "vegetariana", "doce"];

export function BebidasPage() {
  const { bebidas, loading, erro } = useBebidas();

  if (loading) return <p className="feedback">Carregando bebidas...</p>;
  if (erro)
    return <p className="feedback feedback--erro">Erro: {erro.message}</p>;

  return (
    <div className="cardapio-page">
      <section className="cardapio-banner">
        <h1>Bebidas</h1>
      </section>
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
        <ListaBebidas bebidas={bebidas.filter((bebida) => bebida.disponivel)} />
      </section>
    </div>
  );
}
