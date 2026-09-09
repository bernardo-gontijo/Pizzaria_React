import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useClienteAuth } from "../hooks/ClienteAuthContext";

export function ClienteLoginPage() {
  const navigate = useNavigate();
  const { login, loading } = useClienteAuth();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
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
    <section className="pagina-loja">
      <h1>Entrar</h1>

      <form onSubmit={handleSubmit}>
        {erro && <p className="feedback feedback--erro">{erro}</p>}

        <div>
          <label htmlFor="cliente-email">E-mail</label>

          <input
            id="cliente-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="cliente-senha">Senha</label>

          <input
            id="cliente-senha"
            type="password"
            value={senha}
            onChange={(event) => setSenha(event.target.value)}
            required
          />
        </div>

        <button className="botao" type="submit" disabled={loading}>
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>

      <p>
        Ainda não tem conta? <Link to="/cadastro">Criar conta</Link>
      </p>
    </section>
  );
}