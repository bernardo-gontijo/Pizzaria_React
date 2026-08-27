import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export function PagamentoPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const pedidoId = searchParams.get("pedido");
  const [metodo, setMetodo] = useState("pix");
  const [loading, setLoading] = useState(false);

  function handlePagar(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      navigate(`/acompanhar/${pedidoId}`);
    }, 2000);
  }

  if (!pedidoId) {
    return <p>Pedido não encontrado.</p>;
  }

  return (
    <div className="pagamento-page">
      <h1>Pagamento</h1>

      <form onSubmit={handlePagar}>
        <div>
          <label>Método de pagamento</label>
          <select value={metodo} onChange={(e) => setMetodo(e.target.value)}>
            <option value="pix">PIX</option>
            <option value="cartao_credito">Cartão de Crédito</option>
            <option value="cartao_debito">Cartão de Débito</option>
            <option value="dinheiro">Dinheiro</option>
          </select>
        </div>

        <div>
          <p>Total: R$ 50,00</p>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Processando..." : "Pagar agora"}
        </button>
      </form>
    </div>
  );
}
