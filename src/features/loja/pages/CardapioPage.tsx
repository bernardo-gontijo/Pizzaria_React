import { Loading } from "../../../components/Loading";
import { MensagemErro } from "../../../components/MensagemErro";
import { ListaPizzas } from "../components/ListaPizzas";
import { usePizzas } from "../hooks/usePizzas";

export function CardapioPage() {
  const { pizzas, loading, erro } = usePizzas();

  if (loading) return <Loading />;
  if (erro) return <MensagemErro mensagem={erro.message} />;
  return (
    <section className="pagina-cardapio">
      <div className="cabecalho-pagina">
        <p className="sobretitulo">Feitas na hora</p>
        <h1>Nosso cardápio</h1>
        <p>Escolha um sabor e monte seu pedido.</p>
      </div>
      <ListaPizzas pizzas={pizzas.filter((pizza) => pizza.disponivel)} />
    </section>
  );
}
