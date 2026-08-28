import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { atualizarStatusPedido, buscarPedidoPorId } from "../api/pedidos.service";
import type { Pedido } from "../types/pedido";

export function PagamentoPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const pedidoId = searchParams.get("pedido");
  const [metodo, setMetodo] = useState("pix");
  const [loading, setLoading] = useState(false);
  const [pedido, setPedido] = useState<Pedido | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    async function carregarPedido() {
      if (!pedidoId) return;

      const pedidoEncontrado = await buscarPedidoPorId(pedidoId);
      setPedido(pedidoEncontrado);

      if (pedidoEncontrado) {
        setMetodo(pedidoEncontrado.formaPagamento);
      }
    }

    void carregarPedido();
  }, [pedidoId]);

  async function handlePagar(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErro(null);

    try {
      if (pedidoId) {
        await atualizarStatusPedido(pedidoId, {
          status: "confirmado",
          message: `Pagamento confirmado via ${metodo}`,
        });
      }

      navigate(`/acompanhar/${pedidoId}`);
    } catch {
      setErro("Não foi possível confirmar o pagamento. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  if (!pedidoId) {
    return <p className="feedback feedback--erro">Pedido não encontrado.</p>;
  }

  return (
    <section className="pagina-loja pagamento-page">
      <h1>Pagamento</h1>
      <p className="pagina-loja__introducao">Revise o pagamento do seu pedido e confirme para enviá-lo à cozinha.</p>

      <form className="formulario-pagamento" onSubmit={handlePagar}>
        {erro && <p className="erro">{erro}</p>}
        <div className="formulario-pagamento__resumo">
          <span>Pedido #{pedidoId.slice(-6)}</span>
          <strong>{pedido ? `R$ ${pedido.total.toFixed(2)}` : "Carregando total..."}</strong>
        </div>

        <div className="formulario-pagamento__campo">
          <label htmlFor="metodo-pagamento">Método de pagamento</label>
          <select id="metodo-pagamento" value={metodo} onChange={(e) => setMetodo(e.target.value)}>
            <option value="pix">PIX</option>
            <option value="cartao_credito">Cartão de Crédito</option>
            <option value="cartao_debito">Cartão de Débito</option>
            <option value="dinheiro">Dinheiro</option>
          </select>
        </div>

        <button className="formulario-pagamento__botao" type="submit" disabled={loading || !pedido}>
          {loading ? "Processando..." : "Pagar agora"}
        </button>
      </form>
    </section>
  );
}
