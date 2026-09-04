import { NavLink } from "react-router-dom";

export function SideBar() {
  const links = [
    {
      nome: "Dashboard",
      caminho: "/admin/dashboard",
    },
    {
      nome: "Pizzas",
      caminho: "/admin/pizzas",
    },
    {
      nome: "Combos",
      caminho: "/admin/combos",
    },
    {
      nome: "Mesas",
      caminho: "/admin/mesas",
    },
    {
      nome: "Pedidos",
      caminho: "/admin/pedidos",
    },
    {
      nome: "Configurações",
      caminho: "/admin/configuracao",
    },
  ];

  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar__titulo">
        <h2>PizzaShop Admin</h2>
      </div>

      <nav aria-label="Menu administrativo">
        <ul className="admin-sidebar__menu">
          {links.map((link) => (
            <li key={link.caminho}>
              <NavLink
                to={link.caminho}
                className={({ isActive }) =>
                  isActive
                    ? "admin-sidebar__link admin-sidebar__link--ativo"
                    : "admin-sidebar__link"
                }
              >
                {link.nome}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
