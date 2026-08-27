import { Outlet } from "react-router-dom";
import { SideBar } from "./SideBar";

export function Layout() {
  return (
    <div className="admin-layout">
      <SideBar />

      <main className="admin-layout__conteudo">
        <Outlet />
      </main>
    </div>
  );
}
