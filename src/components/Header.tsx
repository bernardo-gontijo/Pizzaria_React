import { NavLink } from "react-router-dom";

import { useCart } from "../context/CartContext";
import { useTenantConfig } from "../context/TenantConfigContext";

export function Header() {
  const { config } = useTenantConfig();
  const { items } = useCart();

  return (
    <header className="header">
      <NavLink className="marca" to="/">
        <img
          alt={`Logotipo da ${config.nome}`}
          src={config.logoUrl || "/images/hero-pizzaria.png"}
        />
      </NavLink>
      <nav aria-label="Navegação principal" className="navegacao">
        <NavLink to="/">Início</NavLink>
        <NavLink to="/cardapio">Cardápio</NavLink>
        <NavLink to="/meus-pedidos">Meus pedidos</NavLink>
        <NavLink to="/carrinho">Carrinho ({items.length})</NavLink>
      </nav>
    </header>
  );
}
