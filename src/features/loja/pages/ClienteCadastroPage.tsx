import { Lock, Mail, User } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";

import { AuthCard } from "../../../components/AuthCard";
import { AuthInput } from "../../../components/AuthInput";
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
    <AuthCard titulo="Criar conta" descricao="Cadastre-se para fazer pedidos">
      <form onSubmit={handleSubmit} className="auth-form">
        <AuthInput
          id="nome"
          label="Nome"
          icone={<User size={16} />}
          type="text"
          placeholder="Seu nome"
          value={nome}
          onChange={(event) => setNome(event.target.value)}
          required
        />

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

        {erro && (
          <p className="auth-form__erro" role="alert">
            {erro}
          </p>
        )}

        <button type="submit" disabled={loading} className="auth-form__botao">
          {loading ? "Criando conta..." : "Criar conta"}
        </button>
      </form>

      <p className="auth-card__rodape">
        Já possui conta? <Link to="/login">Entrar</Link>
      </p>
    </AuthCard>
  );
}