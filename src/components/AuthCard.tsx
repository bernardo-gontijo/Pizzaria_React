import { Utensils } from "lucide-react";
import type { ReactNode } from "react";

interface AuthCardProps {
  titulo: string;
  descricao: string;
  children: ReactNode;
}

export function AuthCard({ titulo, descricao, children }: AuthCardProps) {
  return (
    <div className="auth-pagina">
      <div className="auth-card">
        <div className="auth-card__logo">
          <Utensils size={22} />
        </div>

        <h1 className="auth-card__titulo">{titulo}</h1>
        <p className="auth-card__descricao">{descricao}</p>

        {children}
      </div>
    </div>
  );
}