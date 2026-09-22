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

  // A ordem de "mesas" vem diretamente da API/armazenamento na mesma ordem
  // em que o admin cadastrou cada mesa (ver mesa.service.ts -> criarMesa,
  // que faz [...mesas, novaMesa]). Não reordenamos por número aqui de
  // propósito: quem decide a disposição no salão é o admin, ao cadastrar.
  const mesasLivres = mesas.filter((mesa) => mesa.status === "livre").length;

  return (
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
            {mesasLivres} {mesasLivres === 1 ? "Mesa Livre" : "Mesas Livres"}
          </span>
        </div>
      </div>

      {/*
        Grid fluido: em vez de fixar "4 mesas por fileira", o número de
        mesas por linha se ajusta sozinho à largura disponível e à
        quantidade total de mesas daquela pizzaria (cada tenant pode ter
        um número diferente). A ordem dos cards segue a ordem de
        cadastro das mesas (array "mesas", sem reordenação).
      */}
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
                className="bg-primaria mesa-item__botao"
                onClick={() => aoAbrirMesa(mesa.id, ocupada)}
              >
                {ocupada ? "Ver pedido" : "Abrir mesa"}
              </button>
            </div>
          );
        })}
      </div>

      <div className="mesas-page__area-preparo">
        Cozinha / Área de preparo
      </div>
    </section>
  );
}