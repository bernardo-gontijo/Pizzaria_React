import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
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

  async function aoEncerrarConta() {
    const subtotal = pedido?.subtotal ?? 0;
    const gorjeta = quisPagarGorjeta
      ? (subtotal * Number(percentualGorjeta)) / 100
      : undefined;

    await encerrarConta(gorjeta);
    navigate("/garcom/mesas");
  }

  return (
    <section>
      <h1>Mesa {mesa.numero}</h1>

      {!pedido && <p>Mesa ainda não foi aberta.</p>}

      {pedido && (
        <>
          <h2>Itens do pedido</h2>
          {pedido.itens.length === 0 ? (
            <p>Nenhum item adicionado ainda.</p>
          ) : (
            <ul>
              {pedido.itens.map((item) => (
                <li key={item.id}>
                  {item.pizzaName} — R$ {item.price.toFixed(2)}
                </li>
              ))}
            </ul>
          )}

          <p className="carrinho-total">
            Subtotal: R$ {pedido.subtotal.toFixed(2)}
          </p>

          <button
            type="button"
            className="bg-primaria"
            onClick={() => setModalAberto(true)}
          >
            Adicionar item
          </button>

          {modalAberto && (
            <SeletorItemModal
              onSelecionar={aoSelecionarItemDoCardapio}
              onFechar={() => setModalAberto(false)}
            />
          )}

          <hr />

          <h2>Encerrar conta</h2>
          <div>
            <label>
              <input
                type="checkbox"
                checked={quisPagarGorjeta}
                onChange={(e) => setQuisPagarGorjeta(e.target.checked)}
              />
              Cliente deseja deixar gorjeta
            </label>
          </div>

          {quisPagarGorjeta && (
            <div>
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

          <button className="bg-primaria" onClick={aoEncerrarConta}>
            Encerrar conta da mesa
          </button>
        </>
      )}
    </section>
  );
}
