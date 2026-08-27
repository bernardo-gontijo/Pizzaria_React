import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <section className="pagina-vazia">
      <h1>Página não encontrada</h1>
      <p>O endereço informado não existe.</p>
      <Link className="botao" to="/">
        Voltar ao início
      </Link>
    </section>
  );
}
