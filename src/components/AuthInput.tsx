import { Eye, EyeOff } from "lucide-react";
import { useState, type InputHTMLAttributes, type ReactNode } from "react";

interface AuthInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icone: ReactNode;
}

export function AuthInput({ label, icone, id, type, ...props }: AuthInputProps) {
  const [mostrarSenha, setMostrarSenha] = useState(false);

  const ehSenha = type === "password";
  const tipoReal = ehSenha && mostrarSenha ? "text" : type;

  return (
    <div className="auth-campo">
      <label htmlFor={id}>{label}</label>

      <div className="auth-campo__wrapper">
        <span className="auth-campo__icone" aria-hidden="true">
          {icone}
        </span>

        <input id={id} type={tipoReal} {...props} />

        {ehSenha && (
          <button
            type="button"
            className="auth-campo__olho"
            onClick={() => setMostrarSenha((atual) => !atual)}
            aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
          >
            {mostrarSenha ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
    </div>
  );
}