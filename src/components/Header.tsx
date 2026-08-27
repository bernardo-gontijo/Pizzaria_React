import { NavLink } from "react-router-dom";

import logoPizza from "../assets/logoPizza.png";
import { useTenantConfig } from "../context/TenantConfigContext";

export function Header() {
  const { config } = useTenantConfig();

  return (
    <header className="header">
      <NavLink className="marca" to="/">
        <img alt="" src={logoPizza} />
        <span>{config.nome}</span>
      </NavLink>
      <nav aria-label="Navegação principal" className="navegacao">
        <NavLink to="/">Início</NavLink>
        <NavLink to="/cardapio">Cardápio</NavLink>
      </nav>
    </header>
  );
}
