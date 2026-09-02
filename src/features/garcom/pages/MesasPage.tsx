import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMesas } from "../hooks/useMesas";
import { abrirMesa } from "../api/mesa.service";
import { Loading } from "../../../components/Loading";

export function MesasPage() {
  const { mesas, loading, erro, carregarMesas } = useMesas();
  const navigate = useNavigate();

  useEffect(() => {
    void carregarMesas();
  }, [carregarMesas]);

  async function aoAbrirMesa(mesaId: string, jaOcupada: boolean) {
    if (!jaOcupada) {
      await abrirMesa(mesaId);
    }
    navigate(`/garcom/mesa/${mesaId}`);
  }

  if (loading) return <Loading />;

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
              className="bg-primaria"
              onClick={() => aoAbrirMesa(mesa.id, mesa.status === "ocupada")}
            >
              {mesa.status === "livre" ? "Abrir mesa" : "Ver pedido"}
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
