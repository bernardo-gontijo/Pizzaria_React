import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  atualizarStatusPedido,
  buscarPedidoPorId,
} from "../api/pedidos.service";
import type { Pedido } from "../types/pedido";
import "./PagamentoPage.css";
import { QRCodePagamento } from "../components/QRCodePagamento";

export function PagamentoPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const pedidoId = searchParams.get("pedido");
  const [metodo, setMetodo] = useState("pix");
  const [loading, setLoading] = useState(false);
  const [pedido, setPedido] = useState<Pedido | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [progresso, setProgresso] = useState(0);
  const [mostrarQRCode, setMostrarQRCode] = useState(false);
  const [parcelas, setParcelas] = useState(1);
  const [mostrarParcelas, setMostrarParcelas] = useState(false);

  useEffect(() => {
    async function carregarPedido() {
      if (!pedidoId) return;

      const pedidoEncontrado = await buscarPedidoPorId(pedidoId);
      setPedido(pedidoEncontrado);

      if (pedidoEncontrado) {
        setMetodo(pedidoEncontrado.formaPagamento);
        setMostrarQRCode(pedidoEncontrado.formaPagamento === "pix"); // ✅ ===
      }
    }

    void carregarPedido();
  }, [pedidoId]);

  // Função para calcular parcelas
  function calcularParcelas(total: number, numeroParcelas: number): number {
    const taxaJuros = 0.02;
    const valorParcela = total / numeroParcelas;

    if (numeroParcelas > 1) {
      return Number(
        (valorParcela * (1 + taxaJuros * (numeroParcelas / 12))).toFixed(2),
      );
    }

    return Number(valorParcela.toFixed(2));
  }

  // Função para gerar opções de parcelas
  function gerarOpcoesParcelas(total: number) {
    const opcoes = [];
    const maxParcelas = 12;

    for (let i = 1; i <= maxParcelas; i++) {
      const valorParcela = calcularParcelas(total, i);
      const juros =
        i > 1 ? ` (+${(i * 0.5).toFixed(1)}% juros)` : " (sem juros)";
      const label =
        i === 1
          ? `1x de R$ ${valorParcela.toFixed(2)}`
          : `${i}x de R$ ${valorParcela.toFixed(2)}${juros}`;

      opcoes.push(
        <option key={i} value={i}>
          {label}
        </option>,
      );
    }

    return opcoes;
  }

  // função para simular o progresso
  function simularProgresso(): Promise<void> {
    return new Promise((resolve) => {
      let progressoAtual = 0;
      const intervalo = setInterval(() => {
        const incremento = Math.floor(Math.random() * 10) + 5;
        progressoAtual = Math.min(progressoAtual + incremento, 100);
        setProgresso(progressoAtual);
        console.log("Progresso:", progressoAtual);

        if (progressoAtual === 100) {
          clearInterval(intervalo);
          resolve();
        }
      }, 300);
    });
  }

  async function handlePagar(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErro(null);
    setProgresso(0);

    try {
      await simularProgresso();

      if (pedidoId) {
        const mensagemParcelas =
          metodo === "cartao_credito" && parcelas > 1
            ? `Pagamento confirmado via ${metodo} em ${parcelas}x`
            : `Pagamento confirmado via ${metodo}`;

        await atualizarStatusPedido(pedidoId, {
          status: "confirmado",
          message: mensagemParcelas,
        });
      }
      await new Promise((resolve) => setTimeout(resolve, 500));
      navigate(`/acompanhar/${pedidoId}`);
    } catch {
      setErro("Não foi possível confirmar o pagamento. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  const valorTotal = pedido?.total || 0;
  const valorParcelaAtual =
    parcelas > 0 ? calcularParcelas(valorTotal, parcelas) : 0;
  const totalComJuros =
    parcelas > 1
      ? Number((valorParcelaAtual * parcelas).toFixed(2))
      : valorTotal;

  if (!pedidoId) {
    return <p className="feedback feedback--erro">Pedido não encontrado.</p>;
  }
  // ✅ Removido o if duplicado

  return (
    <section className="pagina-loja pagamento-page">
      <h1>Pagamento</h1>
      <p className="pagina-loja__introducao">
        Revise o pagamento do seu pedido e confirme para enviá-lo à cozinha.
      </p>

      <form className="formulario-pagamento" onSubmit={handlePagar}>
        {erro && <p className="erro">{erro}</p>}
        <div className="formulario-pagamento__resumo">
          <span>Pedido #{pedidoId.slice(-6)}</span>
          <strong>
            {pedido ? `R$ ${pedido.total.toFixed(2)}` : "Carregando total..."}
          </strong>
        </div>

        <div className="formulario-pagamento__campo">
          <label htmlFor="metodo-pagamento">Método de pagamento</label>
          <select
            id="metodo-pagamento"
            value={metodo}
            onChange={(e) => {
              const valor = e.target.value;
              setMetodo(valor);
              setMostrarQRCode(valor === "pix"); // ✅ ===
              setMostrarParcelas(valor === "cartao_credito"); // ✅ ===
              if (valor !== "cartao_credito") {
                // ✅ !==
                setParcelas(1);
              }
            }}
            disabled={loading}
          >
            <option value="pix">PIX</option>
            <option value="cartao_credito">Cartão de Crédito</option>
            <option value="cartao_debito">Cartão de Débito</option>
            <option value="dinheiro">Dinheiro</option>
          </select>
        </div>

        {/* QR CODE PIX */}
        {mostrarQRCode && pedido && !loading && (
          <QRCodePagamento
            valor={pedido.total}
            pedidoId={pedidoId}
            chavePix="pizzaria@email.com"
            nomeRecebedor="Pizzaria React"
          />
        )}

        {/* PARCELAS */}
        {mostrarParcelas && pedido && (
          <div className="formulario-pagamento__campo parcelas-container">
            <label htmlFor="parcelas">Parcelas</label>
            <select
              id="parcelas"
              value={parcelas}
              onChange={(e) => setParcelas(Number(e.target.value))}
              disabled={loading}
            >
              {gerarOpcoesParcelas(valorTotal)}
            </select>

            <div className="parcelas-resumo">
              <div className="parcelas-info">
                <span>
                  {parcelas === 1
                    ? `À vista: R$ ${valorParcelaAtual.toFixed(2)}`
                    : `${parcelas}x de R$ ${valorParcelaAtual.toFixed(2)}`}
                </span>
                {parcelas > 1 && (
                  <span className="parcelas-total">
                    Total: R$ {totalComJuros.toFixed(2)}
                    <small className="juros-info">
                      (R$ {(totalComJuros - valorTotal).toFixed(2)} de juros)
                    </small>
                  </span>
                )}
                {parcelas === 1 && (
                  <span className="parcelas-total sem-juros">
                    Total: R$ {valorTotal.toFixed(2)}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* BOTÃO */}
        <button
          className={`formulario-pagamento__botao ${loading ? "loading" : ""}`}
          type="submit"
          disabled={loading || !pedido}
        >
          {loading ? (
            <div className="progress-container">
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  data-complete={progresso === 100 ? "true" : "false"}
                  style={{ width: `${progresso}%` }}
                />
              </div>
              <span className="progress-text">{progresso}%</span>
            </div>
          ) : metodo === "cartao_credito" && parcelas > 1 ? (
            `Pagar ${parcelas}x de R$ ${valorParcelaAtual.toFixed(2)}`
          ) : metodo === "pix" ? (
            "Confirmar PIX"
          ) : (
            "Pagar agora"
          )}
        </button>
      </form>
    </section>
  );
}
