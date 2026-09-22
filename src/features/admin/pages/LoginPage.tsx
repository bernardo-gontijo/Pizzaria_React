import { Lock, Mail } from "lucide-react";
import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";

import { AuthCard } from "../../../components/AuthCard";
import { AuthInput } from "../../../components/AuthInput";
import { useAuth } from "../hooks/AuthContext";

export function LoginPage() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [lembrar, setLembrar] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function aoEnviar(e: FormEvent) {
    e.preventDefault();
    setErro(null);
    try {
      await login(email, senha);
      navigate("/admin/dashboard");
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro ao entrar");
    }
  }

  return (
    <AuthCard
      titulo="Login administrativo"
      descricao="Acesse o painel de gerenciamento"
    >
      <form onSubmit={aoEnviar} className="auth-form">
        <AuthInput
          id="email"
          label="E-mail"
          icone={<Mail size={16} />}
          type="email"
          placeholder="exemplo@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <AuthInput
          id="senha"
          label="Senha"
          icone={<Lock size={16} />}
          type="password"
          placeholder="••••••••"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          required
        />

        <div className="auth-form__opcoes">
          <label className="auth-form__lembrar">
            <input
              type="checkbox"
              checked={lembrar}
              onChange={(e) => setLembrar(e.target.checked)}
            />
            Lembrar de mim
          </label>

          <a href="#" className="auth-form__esqueci">
            Esqueci a senha?
          </a>
        </div>

        {erro && (
          <p className="auth-form__erro" role="alert">
            {erro}
          </p>
        )}

        <button type="submit" disabled={loading} className="auth-form__botao">
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </AuthCard>
  );
}