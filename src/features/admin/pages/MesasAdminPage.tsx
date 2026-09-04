import { useEffect, useState } from "react";

import { useMesas } from "../../garcom/hooks/useMesas";

export function MesasAdminPage() {
  const { mesas, loading, erro, carregarMesas, criarMesa, removerMesa } =
    useMesas();
  const [numero, setNumero] = useState("");
  const [erroCadastro, setErroCadastro] = useState<string | null>(null);

  useEffect(() => {
    void carregarMesas();
  }, [carregarMesas]);

  async function handleSubmit(evento: React.FormEvent) {
    evento.preventDefault();

    const numeroConvertido = Number(numero);

    if (!numero || Number.isNaN(numeroConvertido) || numeroConvertido <= 0) {
      return;
    }

    // Trava no front também, além da trava no service, para dar feedback
    // imediato sem precisar de round-trip: uma mesa com esse número já
    // cadastrada não pode ser cadastrada de novo.
    const jaCadastrada = mesas.some((mesa) => mesa.numero === numeroConvertido);

    if (jaCadastrada) {
      setErroCadastro(
        `Já existe uma mesa cadastrada com o número ${numeroConvertido}.`,
      );
      return;
    }

    try {
      setErroCadastro(null);
      await criarMesa({ numero: numeroConvertido });
      setNumero("");
    } catch (error) {
      setErroCadastro(
        error instanceof Error ? error.message : "Erro ao cadastrar mesa",
      );
    }
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
            onChange={(evento) => {
              setNumero(evento.target.value);
              if (erroCadastro) setErroCadastro(null);
            }}
            required
          />
        </div>

        {erroCadastro && (
          <p className="feedback feedback--erro">{erroCadastro}</p>
        )}

        <button type="submit">Cadastrar mesa</button>
      </form>

      <hr />

      {loading && <p>Carregando mesas...</p>}

      {erro && <p className="feedback feedback--erro">{erro}</p>}

      {!loading && mesas.length === 0 && (
        <p className="feedback">Nenhuma mesa cadastrada.</p>
      )}

      {!loading && mesas.length > 0 && (
        <section className="mesas-page">
          <div className="mesas-page__cabecalho">
            <div>
              <h1>Mesas</h1>
              <p className="mesas-page__subtitulo">Layout do salão principal</p>
            </div>

            <div className="mesas-page__badges">
              <span className="mesas-badge mesas-badge--disponivel">
                Disponível
              </span>
              <span className="mesas-badge mesas-badge--livres">
                {mesas.filter((mesa) => mesa.status === "livre").length}{" "}
                {mesas.filter((mesa) => mesa.status === "livre").length === 1
                  ? "Mesa Livre"
                  : "Mesas Livres"}
              </span>
            </div>
          </div>

          <div className="mesas-grade">
            {mesas.map((mesa) => {
              const ocupada = mesa.status === "ocupada";

              return (
                <div className="mesa-item" key={mesa.id}>
                  <div className="mesa-item__mesa">
                    <span className="mesa-item__cadeira mesa-item__cadeira--topo" />
                    <span className="mesa-item__cadeira mesa-item__cadeira--base" />
                    <span className="mesa-item__cadeira mesa-item__cadeira--esquerda-cima" />
                    <span className="mesa-item__cadeira mesa-item__cadeira--esquerda-baixo" />
                    <span className="mesa-item__cadeira mesa-item__cadeira--direita-cima" />
                    <span className="mesa-item__cadeira mesa-item__cadeira--direita-baixo" />

                    <div className="mesa-item__tampo">
                      <strong>{mesa.numero}</strong>
                      <span
                        className={
                          ocupada
                            ? "mesa-item__status mesa-item__status--ocupada"
                            : "mesa-item__status mesa-item__status--livre"
                        }
                      >
                        {ocupada ? "OCUPADA" : "LIVRE"}
                      </span>
                    </div>
                  </div>

                  <p className="mesa-item__nome">Mesa {mesa.numero}</p>

                  <button
                    type="button"
                    className="bg-primaria mesa-item__botao"
                    onClick={() => handleRemover(mesa.id, ocupada)}
                  >
                    Remover
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </main>
  );
}
