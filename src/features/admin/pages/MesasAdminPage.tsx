import { useEffect, useState } from "react";

import { useMesas } from "../../garcom/hooks/useMesas";

export function MesasAdminPage() {
  const { mesas, loading, erro, carregarMesas, criarMesa, removerMesa } =
    useMesas();
  const [numero, setNumero] = useState("");

  useEffect(() => {
    void carregarMesas();
  }, [carregarMesas]);

  async function handleSubmit(evento: React.FormEvent) {
    evento.preventDefault();

    const numeroConvertido = Number(numero);

    if (!numero || Number.isNaN(numeroConvertido) || numeroConvertido <= 0) {
      return;
    }

    await criarMesa({ numero: numeroConvertido });
    setNumero("");
  }

  async function handleRemover(id: string, mesaOcupada: boolean) {
    if (mesaOcupada) {
      window.alert(
        "Não é possível remover uma mesa ocupada. Encerre a conta primeiro.",
      );
      return;
    }

    const confirmou = window.confirm(
      "Tem certeza que deseja remover esta mesa?",
    );

    if (!confirmou) return;

    await removerMesa(id);
  }

  return (
    <main>
      <h1>Gerenciamento de Mesas</h1>

      <form onSubmit={handleSubmit}>
        <h2>Cadastrar mesa</h2>

        <div>
          <label htmlFor="numero">Número da mesa</label>
          <input
            id="numero"
            type="number"
            min="1"
            value={numero}
            onChange={(evento) => setNumero(evento.target.value)}
            required
          />
        </div>

        <button type="submit">Cadastrar mesa</button>
      </form>

      <hr />

      <h2>Mesas cadastradas</h2>

      {loading && <p>Carregando mesas...</p>}

      {erro && <p className="feedback feedback--erro">{erro}</p>}

      {!loading && mesas.length === 0 && <p>Nenhuma mesa cadastrada.</p>}

      {mesas.map((mesa) => (
        <article key={mesa.id}>
          <h3>Mesa {mesa.numero}</h3>
          <p>
            <strong>Status:</strong>{" "}
            {mesa.status === "livre" ? "Livre" : "Ocupada"}
          </p>
          <div>
            <button
              type="button"
              onClick={() => handleRemover(mesa.id, mesa.status === "ocupada")}
            >
              Remover
            </button>
          </div>
          <hr />
        </article>
      ))}
    </main>
  );
}
