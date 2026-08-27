import { Link } from "react-router-dom";
import { useTenantConfig } from "../context/TenantConfigContext";

export function HomePage() {
  const { config } = useTenantConfig();
  return (
    <section className="hero">
      <div>
        <p className="sobretitulo">Pizza artesanal, do seu jeito</p>
        <h1>Bem-vindo à {config.nome}</h1>
        <p>Escolha sua pizza favorita e receba no conforto da sua casa.</p>
        <Link className="botao" to="/cardapio">
          Ver cardápio
        </Link>
      </div>
      <img
        alt="Pizza de calabresa pronta para servir"
        src="/images/pizzas/propagandaPizza.jpg"
      />
    </section>
  );
}
