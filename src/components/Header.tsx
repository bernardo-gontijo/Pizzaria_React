import { NavLink, useNavigate } from "react-router-dom";

import { useCart } from "../context/CartContext";
import { useTenantConfig } from "../context/TenantConfigContext";
import { useClienteAuth } from "../features/loja/hooks/ClienteAuthContext";

export function Header() {
  const { config } = useTenantConfig();
  const { items } = useCart();
  const { usuario, autenticado, logout } = useClienteAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/");
  }

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

        <NavLink to="/meus-pedidos">
          Meus pedidos
        </NavLink>

        <NavLink to="/carrinho">
          Carrinho ({items.length})
        </NavLink>

        {!autenticado ? (
          <NavLink to="/login">Entrar</NavLink>
        ) : (
          <>
            <span className="header__saudacao">
              Olá, <strong>{usuario?.nome}</strong>
            </span>

            <button
              type="button"
              onClick={handleLogout}
              className="botao header__sair"
            >
              Sair
            </button>
          </>
        )}
      </nav>
    </header>
  );
}