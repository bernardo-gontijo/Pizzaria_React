import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/AuthContext";

export function LoginPage() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);

  async function aoEnviar(e: React.FormEvent) {
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
    <div className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-3">
      <h1 className="text-2xl font-bold text-white">Login administrativo</h1>
      <form onSubmit={aoEnviar} className="space-y-3">
        <input
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded border px-3 py-2"
          required
        />
        <input
          type="password"
          placeholder="Senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          className="w-full rounded border px-3 py-2"
          required
        />
        {erro && <p className="text-sm text-red-600">{erro}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-primaria px-4 py-2 font-semibold text-white disabled:opacity-50"
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </div>
  );
}
