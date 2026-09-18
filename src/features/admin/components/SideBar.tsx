import { NavLink } from "react-router-dom";
import {
  ClipboardList,
  CupSoda,
  LayoutDashboard,
  LineChart,
  Layers,
  Settings,
  Table,
  Utensils,
} from "lucide-react";

export function SideBar() {
  const links = [
    {
      nome: "Dashboard",
      caminho: "/admin/dashboard",
      Icone: LayoutDashboard,
    },
    {
      nome: "Pizzas",
      caminho: "/admin/pizzas",
      Icone: Utensils,
    },
    {
      nome: "Bebidas",
      caminho: "/admin/bebidas",
      Icone: CupSoda,
    },
    {
      nome: "Combos",
      caminho: "/admin/combos",
      Icone: Layers,
    },
    {
      nome: "Mesas",
      caminho: "/admin/mesas",
      Icone: Table,
    },
    {
      nome: "Pedidos",
      caminho: "/admin/pedidos",
      Icone: ClipboardList,
    },
    {
      nome: "Relatórios",
      caminho: "/admin/relatorios",
      Icone: LineChart,
    },
    {
      nome: "Configurações",
      caminho: "/admin/configuracao",
      Icone: Settings,
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
                <link.Icone size={17} aria-hidden="true" />
                {link.nome}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}