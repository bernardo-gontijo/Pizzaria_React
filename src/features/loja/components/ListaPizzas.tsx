import type { Pizza } from "../types/pizza";
import { PizzaCard } from "./PizzaCard";

interface ListaPizzasProps {
  pizzas: readonly Pizza[];
}

export function ListaPizzas({ pizzas }: ListaPizzasProps) {
  if (pizzas.length === 0)
    return <p className="feedback">Nenhuma pizza disponível no momento.</p>;
  return (
    <div className="lista-pizzas">
      {pizzas.map((pizza) => (
        <PizzaCard key={pizza.id} pizza={pizza} />
      ))}
    </div>
  );
}
