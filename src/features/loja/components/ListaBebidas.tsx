import type { Bebida } from "../types/bebidas";
import { BebidaCard } from "./BebidaCard";

interface ListaBebidasProps {
  bebidas: readonly Bebida[];
}

export function ListaBebidas({ bebidas }: ListaBebidasProps) {
  if (bebidas.length === 0) {
    return <p className="feedback">Nenhuma bebida disponível no momento.</p>;
  }

  return (
    <div className="lista-pizzas">
      {bebidas.map((bebida) => (
        <BebidaCard key={bebida.id} bebida={bebida} />
      ))}
    </div>
  );
}
