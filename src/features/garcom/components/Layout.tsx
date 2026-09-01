import { Suspense } from "react";
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
      <header className="admin-sidebar">
        <div className="admin-sidebar__titulo">
          <h2>Área do garçom</h2>
        </div>
        <p>{user?.nome}</p>
        <button className="bg-primaria" onClick={aoSair}>
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
