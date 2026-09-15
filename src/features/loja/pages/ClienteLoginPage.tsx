import { Lock, Mail } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";

import { AuthCard } from "../../../components/AuthCard";
import { AuthInput } from "../../../components/AuthInput";
import { useClienteAuth } from "../hooks/ClienteAuthContext";

export function ClienteLoginPage() {
  const navigate = useNavigate();
  const { login, loading } = useClienteAuth();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [lembrar, setLembrar] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    try {
      setErro(null);

      await login(email, senha);

      navigate("/meus-pedidos");
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível fazer login",
      );
    }
  }

  return (
    <AuthCard titulo="Login do cliente" descricao="Acompanhe seus pedidos">
      <form onSubmit={handleSubmit} className="auth-form">
        <AuthInput
          id="email"
          label="E-mail"
          icone={<Mail size={16} />}
          type="email"
          placeholder="exemplo@email.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />

        <AuthInput
          id="senha"
          label="Senha"
          icone={<Lock size={16} />}
          type="password"
          placeholder="••••••••"
          value={senha}
          onChange={(event) => setSenha(event.target.value)}
          required
        />

        <div className="auth-form__opcoes">
          <label className="auth-form__lembrar">
            <input
              type="checkbox"
              checked={lembrar}
              onChange={(event) => setLembrar(event.target.checked)}
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

      <p className="auth-card__rodape">
        Ainda não tem conta? <Link to="/cadastro">Criar conta</Link>
      </p>
    </AuthCard>
  );
}