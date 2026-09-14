import { Suspense } from "react";
import { LogOut } from "lucide-react";
import { Outlet, useNavigate } from "react-router-dom";
import { Loading } from "../../../components/Loading";
import { useAuth } from "../hooks/AuthContext";

export function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function aoSair() {
    logout();
    navigate("/garcom/login");
  }

  return (
    <div className="admin-layout">
      <header className="garcom-sidebar">
        <div>
          <div className="garcom-sidebar__titulo">
            <h2>Área do garçom</h2>
          </div>

          <p className="garcom-sidebar__rotulo">Garçom</p>

          <div className="garcom-sidebar__usuario">
            <strong>{user?.nome}</strong>
            <span>Em serviço</span>
          </div>
        </div>

        <button
          type="button"
          className="garcom-sidebar__sair"
          onClick={aoSair}
        >
          <LogOut size={16} />
          Sair
        </button>
      </header>

      <main className="admin-layout__conteudo">
        <Suspense fallback={<Loading />}>
          <Outlet />
        </Suspense>
      </main>
    </div>
  );
}