import { Outlet } from "react-router-dom";
import { Footer } from "./Footer";
import { Header } from "./Header";

export function Layout() {
  return (
    <div className="aplicacao">
      <Header />
      <main className="conteudo">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
