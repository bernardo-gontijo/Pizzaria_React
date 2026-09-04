import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Minus, Plus, ShoppingCart, X } from "lucide-react";
import { usePedidoMesa } from "../hooks/usePedidoMesa";
import { Loading } from "../../../components/Loading";
import { SeletorItemModal } from "../components/SeletorItemModal";
import type { ItemPedido } from "../../loja/types/pedido";

export function PedidoMesaPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    mesa,
    pedido,
    loading,
    erro,
    carregar,
    adicionarItem,
    atualizarQuantidadeItem,
    removerItem,
    encerrarConta,
  } = usePedidoMesa(id!);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  const [modalAberto, setModalAberto] = useState(false);
  const [quisPagarGorjeta, setQuisPagarGorjeta] = useState(false);
  const [percentualGorjeta, setPercentualGorjeta] = useState("10");

  if (loading) return <Loading />;

  if (erro) {
    return <p className="feedback feedback--erro">{erro}</p>;
  }

  if (!mesa) {
    return <p className="feedback feedback--erro">Mesa não encontrada.</p>;
  }

  async function aoSelecionarItemDoCardapio(item: Omit<ItemPedido, "id">) {
    await adicionarItem(item);
  }

  async function aoAumentarQuantidade(item: ItemPedido) {
    await atualizarQuantidadeItem(item.id, item.quantity + 1);
  }

  async function aoDiminuirQuantidade(item: ItemPedido) {
    if (item.quantity <= 1) return;
    await atualizarQuantidadeItem(item.id, item.quantity - 1);
  }

  async function aoRemoverItem(itemId: string) {
    await removerItem(itemId);
  }

  const totalItens =
    pedido?.itens.reduce((soma, item) => soma + item.quantity, 0) ?? 0;

  const subtotal = pedido?.subtotal ?? 0;
  const gorjeta = quisPagarGorjeta
    ? (subtotal * Number(percentualGorjeta)) / 100
    : 0;
  const totalFinal = subtotal + gorjeta;

  async function aoEncerrarConta() {
    await encerrarConta(quisPagarGorjeta ? gorjeta : undefined);
    navigate("/garcom/mesas");
  }

  return (
    <section className="pedido-mesa-page">
      <h1>Mesa {mesa.numero}</h1>
      <hr />

      {!pedido && <p>Mesa ainda não foi aberta.</p>}

      {pedido && (
        <>
          <div className="pedido-mesa-page__cabecalho">
            <h2>Itens do pedido</h2>
            <span className="pedido-mesa-page__badge">
              {totalItens} {totalItens === 1 ? "item selecionado" : "itens selecionados"}
            </span>
          </div>

          {pedido.itens.length === 0 ? (
            <p>Nenhum item adicionado ainda.</p>
          ) : (
            <div className="pedido-mesa-page__grade">
              {pedido.itens.map((item) => (
                <div key={item.id} className="pedido-mesa-page__item">
                  <div className="pedido-mesa-page__item-info">
                    <strong>{item.pizzaName}</strong>
                    <span>R$ {item.price.toFixed(2)}</span>
                  </div>

                  <div className="pedido-mesa-page__item-controles">
                    <div className="pedido-mesa-page__stepper">
                      <button
                        type="button"
                        aria-label={`Diminuir quantidade de ${item.pizzaName}`}
                        disabled={item.quantity <= 1}
                        onClick={() => void aoDiminuirQuantidade(item)}
                      >
                        <Minus size={14} />
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        type="button"
                        aria-label={`Aumentar quantidade de ${item.pizzaName}`}
                        onClick={() => void aoAumentarQuantidade(item)}
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    <button
                      type="button"
                      className="pedido-mesa-page__remover"
                      aria-label={`Remover ${item.pizzaName} do pedido`}
                      onClick={() => void aoRemoverItem(item.id)}
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="pedido-mesa-page__acoes">
            <button
              type="button"
              className="pedido-mesa-page__adicionar"
              onClick={() => setModalAberto(true)}
            >
              <ShoppingCart size={16} />
              Adicionar item
            </button>
          </div>

          {modalAberto && (
            <SeletorItemModal
              onSelecionar={aoSelecionarItemDoCardapio}
              onFechar={() => setModalAberto(false)}
            />
          )}

          <div className="pedido-mesa-page__encerrar">
            <h2>Encerrar conta</h2>

            <label className="pedido-mesa-page__checkbox">
              <input
                type="checkbox"
                checked={quisPagarGorjeta}
                onChange={(e) => setQuisPagarGorjeta(e.target.checked)}
              />
              Cliente deseja deixar gorjeta
            </label>

            {quisPagarGorjeta && (
              <div className="pedido-mesa-page__gorjeta-percentual">
                <label htmlFor="percentualGorjeta">Percentual da gorjeta</label>
                <select
                  id="percentualGorjeta"
                  value={percentualGorjeta}
                  onChange={(e) => setPercentualGorjeta(e.target.value)}
                >
                  <option value="10">10%</option>
                  <option value="15">15%</option>
                  <option value="20">20%</option>
                </select>
              </div>
            )}

            <div className="pedido-mesa-page__total">
              <span>Total final</span>
              <strong>R$ {totalFinal.toFixed(2)}</strong>
            </div>

            <button
              type="button"
              className="pedido-mesa-page__encerrar-botao"
              onClick={() => void aoEncerrarConta()}
            >
              Encerrar conta da mesa
            </button>
          </div>
        </>
      )}
    </section>
  );
}