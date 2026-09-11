import { useEffect, useState, type FormEvent } from "react";

import { Minus, Plus, ShoppingCart, X } from "lucide-react";

import { useNavigate, useParams } from "react-router-dom";

import { Loading } from "../../../components/Loading";
import { SeletorItemModal } from "../components/SeletorItemModal";
import { usePedidoMesa } from "../hooks/usePedidoMesa";

import type { ItemPedido } from "../../loja/types/pedido";

export function PedidoMesaPage() {
  const { id } = useParams<{ id: string }>();

  const navigate = useNavigate();

  const {
    mesa,

    comandas,
    comandaSelecionada,

    pedido,

    loading,
    erro,

    carregar,

    selecionarComanda,
    criarNovaComanda,

    adicionarItem,
    atualizarQuantidadeItem,
    removerItem,

    pagarComandaSelecionada,
  } = usePedidoMesa(id!);

  const [modalAberto, setModalAberto] = useState(false);

  const [nomeNovaComanda, setNomeNovaComanda] = useState("");

  const [criandoComanda, setCriandoComanda] = useState(false);

  const [pagandoComanda, setPagandoComanda] = useState(false);

  const [erroAcao, setErroAcao] = useState<string | null>(null);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  if (loading) {
    return <Loading />;
  }

  if (!mesa) {
    return (
      <p className="feedback feedback--erro">
        {erro ?? "Mesa não encontrada."}
      </p>
    );
  }

  const comandaPaga = comandaSelecionada?.status === "paga";

  const totalItens =
    pedido?.itens.reduce((soma, item) => soma + item.quantity, 0) ?? 0;

  const subtotal = pedido?.subtotal ?? 0;

  async function aoCriarComanda(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();

    const nome = nomeNovaComanda.trim();

    if (!nome) {
      setErroAcao("Informe um nome para a comanda.");

      return;
    }

    try {
      setCriandoComanda(true);
      setErroAcao(null);

      const novaComanda = await criarNovaComanda(nome);

      selecionarComanda(novaComanda.id);

      setNomeNovaComanda("");
    } catch (error) {
      setErroAcao(
        error instanceof Error ? error.message : "Erro ao criar comanda.",
      );
    } finally {
      setCriandoComanda(false);
    }
  }

  async function aoSelecionarItemDoCardapio(item: Omit<ItemPedido, "id">) {
    try {
      setErroAcao(null);

      await adicionarItem(item);
    } catch (error) {
      setErroAcao(
        error instanceof Error ? error.message : "Erro ao adicionar item.",
      );
    }
  }

  async function aoAumentarQuantidade(item: ItemPedido) {
    try {
      setErroAcao(null);

      await atualizarQuantidadeItem(item.id, item.quantity + 1);
    } catch (error) {
      setErroAcao(
        error instanceof Error
          ? error.message
          : "Erro ao atualizar quantidade.",
      );
    }
  }

  async function aoDiminuirQuantidade(item: ItemPedido) {
    if (item.quantity <= 1) {
      return;
    }

    try {
      setErroAcao(null);

      await atualizarQuantidadeItem(item.id, item.quantity - 1);
    } catch (error) {
      setErroAcao(
        error instanceof Error
          ? error.message
          : "Erro ao atualizar quantidade.",
      );
    }
  }

  async function aoRemoverItem(itemId: string) {
    try {
      setErroAcao(null);

      await removerItem(itemId);
    } catch (error) {
      setErroAcao(
        error instanceof Error ? error.message : "Erro ao remover item.",
      );
    }
  }

  async function aoPagarComanda() {
    if (!comandaSelecionada) {
      return;
    }

    if (comandaSelecionada.status === "paga") {
      return;
    }

    const confirmou = window.confirm(
      `Confirmar pagamento da ${
        comandaSelecionada.nome ?? `Comanda ${comandaSelecionada.id}`
      }?`,
    );

    if (!confirmou) {
      return;
    }

    try {
      setPagandoComanda(true);
      setErroAcao(null);

      await pagarComandaSelecionada();
    } catch (error) {
      setErroAcao(
        error instanceof Error ? error.message : "Erro ao pagar comanda.",
      );
    } finally {
      setPagandoComanda(false);
    }
  }

  return (
    <section className="pedido-mesa-page">
      <button type="button" onClick={() => navigate("/garcom/mesas")}>
        ← Voltar para mesas
      </button>

      <h1>Mesa {mesa.numero}</h1>

      <p>
        <strong>Status da mesa:</strong>{" "}
        {mesa.status === "livre" ? "Livre" : "Ocupada"}
      </p>

      <hr />

      {(erro || erroAcao) && (
        <p className="feedback feedback--erro">{erroAcao ?? erro}</p>
      )}

      <section>
        <h2>Comandas</h2>

        <form onSubmit={(evento) => void aoCriarComanda(evento)}>
          <label htmlFor="nomeNovaComanda">Nome da nova comanda</label>

          <div>
            <input
              id="nomeNovaComanda"
              type="text"
              value={nomeNovaComanda}
              placeholder="Ex.: João"
              maxLength={120}
              disabled={criandoComanda}
              onChange={(evento) => setNomeNovaComanda(evento.target.value)}
            />

            <button
              type="submit"
              className="bg-primaria"
              disabled={criandoComanda}
            >
              <Plus size={16} />

              {criandoComanda ? "Criando..." : "Nova comanda"}
            </button>
          </div>
        </form>

        {comandas.length === 0 ? (
          <p>Nenhuma comanda criada nesta mesa.</p>
        ) : (
          <div>
            {comandas.map((comanda) => {
              const selecionada = comandaSelecionada?.id === comanda.id;

              return (
                <button
                  key={comanda.id}
                  type="button"
                  className={selecionada ? "bg-primaria" : undefined}
                  onClick={() => {
                    setErroAcao(null);

                    selecionarComanda(comanda.id);
                  }}
                >
                  {comanda.nome ?? `Comanda ${comanda.id}`}

                  {" — "}

                  {comanda.status === "paga" ? "Paga" : "Aberta"}
                </button>
              );
            })}
          </div>
        )}
      </section>

      <hr />

      {!comandaSelecionada && (
        <p>Crie ou selecione uma comanda para começar o atendimento.</p>
      )}

      {comandaSelecionada && (
        <>
          <div className="pedido-mesa-page__cabecalho">
            <div>
              <h2>
                {comandaSelecionada.nome ?? `Comanda ${comandaSelecionada.id}`}
              </h2>

              <p>
                <strong>Status:</strong> {comandaPaga ? "Paga" : "Aberta"}
              </p>
            </div>

            <span className="pedido-mesa-page__badge">
              {totalItens}{" "}
              {totalItens === 1 ? "item selecionado" : "itens selecionados"}
            </span>
          </div>

          {!pedido || pedido.itens.length === 0 ? (
            <p>Nenhum item adicionado nesta comanda.</p>
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
                        disabled={item.quantity <= 1 || comandaPaga}
                        onClick={() => void aoDiminuirQuantidade(item)}
                      >
                        <Minus size={14} />
                      </button>

                      <span>{item.quantity}</span>

                      <button
                        type="button"
                        aria-label={`Aumentar quantidade de ${item.pizzaName}`}
                        disabled={comandaPaga}
                        onClick={() => void aoAumentarQuantidade(item)}
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    <button
                      type="button"
                      className="pedido-mesa-page__remover"
                      aria-label={`Remover ${item.pizzaName} do pedido`}
                      disabled={comandaPaga}
                      onClick={() => void aoRemoverItem(item.id)}
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!comandaPaga && (
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
          )}

          {modalAberto && !comandaPaga && (
            <SeletorItemModal
              onSelecionar={aoSelecionarItemDoCardapio}
              onFechar={() => setModalAberto(false)}
            />
          )}

          <div className="pedido-mesa-page__encerrar">
            <h2>Resumo da comanda</h2>

            <div className="pedido-mesa-page__total">
              <span>Total</span>

              <strong>R$ {subtotal.toFixed(2)}</strong>
            </div>

            {comandaPaga ? (
              <p>Esta comanda já foi paga.</p>
            ) : (
              <button
                type="button"
                className="pedido-mesa-page__encerrar-botao"
                disabled={pagandoComanda}
                onClick={() => void aoPagarComanda()}
              >
                {pagandoComanda ? "Processando..." : "Pagar esta comanda"}
              </button>
            )}
          </div>
        </>
      )}

      {mesa.status === "livre" && comandas.length > 0 && (
        <p>
          Todas as comandas foram pagas. A mesa está livre para um novo
          atendimento.
        </p>
      )}
    </section>
  );
}
