interface DashboardCardProps {
  titulo: string;
  valor: string | number;
  descricao?: string;
}

export function DashboardCard({
  titulo,
  valor,
  descricao,
}: DashboardCardProps) {
  return (
    <article>
      <h2>{titulo}</h2>

      <strong>{valor}</strong>

      {descricao && <p>{descricao}</p>}
    </article>
  );
}
