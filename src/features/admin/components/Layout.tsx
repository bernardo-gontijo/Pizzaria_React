import { Suspense } from "react";
import { Outlet } from "react-router-dom";
import { Loading } from "../../../components/Loading";
import { SideBar } from "./SideBar";

export function Layout() {
  return (
    <div className="admin-layout">
      <SideBar />

      <main className="admin-layout__conteudo">
        <Suspense fallback={<Loading />}>
          <Outlet />
        </Suspense>
      </main>
    </div>
  );
}
