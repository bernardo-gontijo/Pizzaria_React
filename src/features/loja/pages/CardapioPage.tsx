import { usePizzas } from "../hooks/usePizzas";
import { ListaPizzas } from "../components/ListaPizzas";

export function CardapioPage() {
  const { pizzas, loading, erro } = usePizzas();
  if (loading) return <p>Carregando cardápio...</p>;
  if (erro) return <p>Erro: {erro.message}</p>;

  return (
    <div className="cardapio-page">
      <h1>Cardápio</h1>
      <ListaPizzas pizzas={pizzas} />
    </div>
  );
}
