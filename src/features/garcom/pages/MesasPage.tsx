import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { Loading } from "../../../components/Loading";
import { useMesas } from "../hooks/useMesas";

export function MesasPage() {
  const { mesas, loading, erro, carregarMesas } = useMesas();

  const navigate = useNavigate();

  useEffect(() => {
    void carregarMesas();
  }, [carregarMesas]);

  function aoSelecionarMesa(mesaId: string) {
    navigate(`/garcom/mesa/${mesaId}`);
  }

  if (loading) {
    return <Loading />;
  }

  if (erro) {
    return <p className="feedback feedback--erro">{erro}</p>;
  }

  if (mesas.length === 0) {
    return (
      <p className="feedback">
        Nenhuma mesa cadastrada. Peça ao administrador para cadastrar mesas em
        Configuração.
      </p>
    );
  }

  return (
    <section>
      <h1>Mesas</h1>

      <div>
        {mesas.map((mesa) => (
          <article key={mesa.id}>
            <h2>Mesa {mesa.numero}</h2>

            <p>
              <strong>Status:</strong>{" "}
              {mesa.status === "livre" ? "Livre" : "Ocupada"}
            </p>

            <button
              type="button"
              className="bg-primaria"
              onClick={() => aoSelecionarMesa(mesa.id)}
            >
              {mesa.status === "livre" ? "Abrir mesa" : "Ver comandas"}
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
