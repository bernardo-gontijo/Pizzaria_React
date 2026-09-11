import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useClienteAuth } from "../hooks/ClienteAuthContext";

export function ClienteCadastroPage() {
  const navigate = useNavigate();
  const { cadastrar, loading } = useClienteAuth();

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    try {
      setErro(null);

      await cadastrar(nome, email, senha);

      navigate("/meus-pedidos");
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível criar sua conta",
      );
    }
  }

  return (
    <section className="pagina-loja">
      <h1>Criar conta</h1>

      <form onSubmit={handleSubmit}>
        {erro && <p className="feedback feedback--erro">{erro}</p>}

        <div>
          <label htmlFor="cliente-nome">Nome</label>

          <input
            id="cliente-nome"
            value={nome}
            onChange={(event) => setNome(event.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="cadastro-email">E-mail</label>

          <input
            id="cadastro-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="cadastro-senha">Senha</label>

          <input
            id="cadastro-senha"
            type="password"
            value={senha}
            onChange={(event) => setSenha(event.target.value)}
            required
          />
        </div>

        <button className="botao" type="submit" disabled={loading}>
          {loading ? "Criando conta..." : "Criar conta"}
        </button>
      </form>

      <p>
        Já possui conta? <Link to="/login">Entrar</Link>
      </p>
    </section>
  );
}