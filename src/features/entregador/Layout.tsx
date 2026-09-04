import { Outlet } from "react-router-dom";
import { EntregadorSidebar } from "./components/entregadorSidebar";

export function EntregadorLayout() {
  return (
    <div className="entregador-layout">
      <EntregadorSidebar />
      <div className="entregador-layout__conteudo">
        <Outlet />
      </div>
    </div>
  );
}
