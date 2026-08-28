import { Link } from "react-router-dom";

import { useTenantConfig } from "../context/TenantConfigContext";

export function HomePage() {
  const { config } = useTenantConfig();

  return (
    <>
      <section className="hero">
        <div className="hero__conteudo">
          <p className="sobretitulo">Forno, sabor e tradição</p>
          <h1>{config.nome}</h1>
          <p>
            Pizzas artesanais preparadas com ingredientes selecionados e
            entregues quentinhas para você.
          </p>
          <Link className="botao" to="/cardapio">
            Conheça o cardápio
          </Link>
        </div>
      </section>

      <section className="home-sobre" id="sobre">
        <p className="sobretitulo">A nossa casa</p>
        <h2>Pizza feita com calma, para ser compartilhada.</h2>
        <p>
          Estamos em {config.endereco}. Atendemos em{" "}
          {config.horarioFuncionamento} e levamos sabor até você.
        </p>
      </section>
    </>
  );
}
