// src/features/entregador/components/EntregadorSidebar.tsx
import { NavLink } from 'react-router-dom';

export function EntregadorSidebar() {
  return (
    <aside className="entregador-sidebar">
      <div className="entregador-sidebar__titulo">
        <h2> Entregador</h2>
      </div>
      <nav className="entregador-sidebar__menu">
        <NavLink 
          to="/entregador" 
          className={({ isActive }) => 
            `entregador-sidebar__link${isActive ? ' entregador-sidebar__link--ativo' : ''}`
          }
        >
          Dashboard
        </NavLink>
        <NavLink 
          to="/entregador/pedidos" 
          className={({ isActive }) => 
            `entregador-sidebar__link${isActive ? ' entregador-sidebar__link--ativo' : ''}`
          }
        >
           Pedidos
        </NavLink>
        <NavLink 
          to="/entregador/entregas" 
          className={({ isActive }) => 
            `entregador-sidebar__link${isActive ? ' entregador-sidebar__link--ativo' : ''}`
          }
        >
           Entregas
        </NavLink>
      </nav>
    </aside>
  );
}