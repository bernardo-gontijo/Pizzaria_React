export function EntregadorDashboard() {
  return (
    <main>  {/* ← ADICIONA O <main> AQUI */}
      <h1>Dashboard do Entregador</h1>
      <p>Bem-vindo ao painel do entregador!</p>
      
      <section>
        <article>
          <h3>Pedidos Hoje</h3>
          <strong>12</strong>
        </article>
        <article>
          <h3>Entregas Realizadas</h3>
          <strong>8</strong>
        </article>
        <article>
          <h3>Pendentes</h3>
          <strong>4</strong>
        </article>
      </section>
    </main>
  );
}