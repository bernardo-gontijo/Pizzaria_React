import { useParams } from "react-router-dom";
import { usePizzas } from "../hooks/usePizzas";
import { ListaPizzas } from "../components/ListaPizzas";

export function CategoriaPage() {
  const { categoria } = useParams<{ categoria: string }>();
  const { pizzas, loading, erro } = usePizzas();

  const pizzasFiltradas = pizzas.filter(
    (p) => p.categoria.toLowerCase() === categoria?.toLowerCase(),
  );

  if (loading) return <p>Carregando...</p>;
  if (erro) return <p>Erro: {erro.message}</p>;

  return (
    <div className="categoria-page">
      <h1>{categoria}</h1>
      <ListaPizzas pizzas={pizzasFiltradas} />
    </div>
  );
}
