
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
    <div className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-3">
      <h1 className="text-2xl font-bold text-white">
        Login do cliente
      </h1>

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="w-full rounded border px-3 py-2"
          required
        />

        <input
          type="password"
          placeholder="Senha"
          value={senha}
          onChange={(event) => setSenha(event.target.value)}
          className="w-full rounded border px-3 py-2"
          required
        />

        {erro && (
          <p className="text-sm text-red-600" role="alert">
            {erro}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-primaria px-4 py-2 font-semibold text-white disabled:opacity-50"
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>

      <p className="text-white">
        Ainda não tem conta?{" "}
        <Link to="/cadastro" className="font-semibold text-white">
          Criar conta
        </Link>
      </p>
    </div>
  );
}
