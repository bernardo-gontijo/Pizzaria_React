import { useNavigate } from "react-router-dom";

import { FormularioCheckout } from "../components/FormularioCheckout";
import { usePedido } from "../hooks/usePedido";
import type { DadosCheckout } from "../types/pedido";

export function CheckoutPage() {
  const navigate = useNavigate();
  const { loading, erro, finalizar } = usePedido();

  async function finalizarPedido(dados: DadosCheckout) {
    const pedido = await finalizar(dados);

    if (pedido) {
      navigate(`/pagamento?pedido=${pedido.id}`);
    }
  }

  return (
    <section className="pagina-loja checkout-page">
      <h1>Finalizar pedido</h1>
      <FormularioCheckout
        erro={erro}
        loading={loading}
        onSubmit={finalizarPedido}
      />
    </section>
  );
}
