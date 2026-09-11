import { useEffect, useState } from "react";

import "./CupomCarrinho.css";

import {
  listarCuponsDisponiveis,
  validarCupomCliente,
} from "../api/cuponsCliente.service";

import type {
  CupomDisponivel,
  CupomQuaseDisponivel,
} from "../api/cuponsCliente.service";

import { useCart } from "../../../context/CartContext";

function formatarDinheiro(valor: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valor);
}

function descricaoDesconto(
  tipoDesconto: "percentual" | "fixo",
  valor: number,
): string {
  if (tipoDesconto === "percentual") {
    return `${valor}% de desconto`;
  }

  return `${formatarDinheiro(valor)} de desconto`;
}

export function CupomCarrinho() {
  const { subtotal, cupomAplicado, aplicarCupom, removerCupom } = useCart();

  const [codigo, setCodigo] = useState("");

  const [cuponsDisponiveis, setCuponsDisponiveis] = useState<CupomDisponivel[]>(
    [],
  );

  const [quaseDisponiveis, setQuaseDisponiveis] = useState<
    CupomQuaseDisponivel[]
  >([]);

  const [carregandoLista, setCarregandoLista] = useState(false);

  const [aplicando, setAplicando] = useState(false);

  const [erro, setErro] = useState<string | null>(null);

  const [erroLista, setErroLista] = useState<string | null>(null);

  useEffect(() => {
    let cancelado = false;

    async function carregarCupons() {
      if (cupomAplicado || subtotal <= 0) {
        setCuponsDisponiveis([]);
        setQuaseDisponiveis([]);
        setCarregandoLista(false);
        setErroLista(null);
        return;
      }

      try {
        setCarregandoLista(true);
        setErroLista(null);

        const resultado = await listarCuponsDisponiveis(subtotal);

        if (cancelado) {
          return;
        }

        setCuponsDisponiveis(resultado.disponiveis);

        setQuaseDisponiveis(resultado.quaseDisponiveis);
      } catch (error) {
        if (cancelado) {
          return;
        }

        const mensagem =
          error instanceof Error
            ? error.message
            : "Não foi possível carregar os cupons.";

        if (mensagem.includes("entrar na sua conta")) {
          setErroLista(null);
          setCuponsDisponiveis([]);
          setQuaseDisponiveis([]);
          return;
        }

        setErroLista(mensagem);
      } finally {
        if (!cancelado) {
          setCarregandoLista(false);
        }
      }
    }

    void carregarCupons();

    return () => {
      cancelado = true;
    };
  }, [subtotal, cupomAplicado]);

  async function aplicarCodigo(codigoCupom: string) {
    const codigoNormalizado = codigoCupom.trim().toUpperCase();

    if (!codigoNormalizado) {
      setErro("Digite um código de cupom.");
      return;
    }

    try {
      setAplicando(true);
      setErro(null);

      const resultado = await validarCupomCliente(codigoNormalizado, subtotal);

      if (!resultado.valido) {
        setErro(resultado.erro);
        return;
      }

      aplicarCupom({
        codigo: resultado.codigo,

        tipoDesconto: resultado.tipoDesconto,

        valor: resultado.valor,

        desconto: resultado.descontoCalculado,
      });

      setCodigo(resultado.codigo);
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível aplicar o cupom.",
      );
    } finally {
      setAplicando(false);
    }
  }

  function aoEnviarFormulario(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    void aplicarCodigo(codigo);
  }

  function aoRemoverCupom() {
    removerCupom();
    setCodigo("");
    setErro(null);
  }

  if (cupomAplicado) {
    return (
      <section
        className="cupom-carrinho cupom-carrinho--aplicado"
        aria-label="Cupom aplicado"
      >
        <div className="cupom-carrinho__cabecalho">
          <div>
            <strong>Cupom aplicado</strong>

            <p>{cupomAplicado.codigo}</p>
          </div>

          <button type="button" onClick={aoRemoverCupom}>
            Remover
          </button>
        </div>

        <p>
          Você economizou{" "}
          <strong>{formatarDinheiro(cupomAplicado.desconto)}</strong>.
        </p>
      </section>
    );
  }

  return (
    <section className="cupom-carrinho" aria-label="Cupons">
      <div>
        <h3>Cupom de desconto</h3>

        <form onSubmit={aoEnviarFormulario} className="cupom-carrinho__form">
          <label htmlFor="codigo-cupom" className="sr-only">
            Código do cupom
          </label>

          <input
            id="codigo-cupom"
            value={codigo}
            placeholder="Digite seu cupom"
            autoComplete="off"
            onChange={(event) => {
              setCodigo(event.target.value.toUpperCase());

              setErro(null);
            }}
          />

          <button type="submit" disabled={aplicando}>
            {aplicando ? "Aplicando..." : "Aplicar"}
          </button>
        </form>

        {erro && (
          <p role="alert" className="cupom-carrinho__erro">
            {erro}
          </p>
        )}
      </div>

      <div className="cupom-carrinho__disponiveis">
        <h3>Cupons disponíveis</h3>

        {carregandoLista && <p>Buscando cupons...</p>}

        {erroLista && (
          <p role="alert" className="cupom-carrinho__erro">
            {erroLista}
          </p>
        )}

        {!carregandoLista &&
          !erroLista &&
          cuponsDisponiveis.length === 0 &&
          quaseDisponiveis.length === 0 && (
            <p>Nenhum cupom disponível para este pedido.</p>
          )}

        {cuponsDisponiveis.map((cupom) => (
          <article
            key={cupom.codigo}
            className="cupom-card cupom-card--disponivel"
          >
            <div>
              <strong className="cupom-card__codigo">{cupom.codigo}</strong>

              <p>{descricaoDesconto(cupom.tipoDesconto, cupom.valor)}</p>

              {cupom.pedidoMinimo > 0 && (
                <small>
                  Pedido mínimo: {formatarDinheiro(cupom.pedidoMinimo)}
                </small>
              )}

              <p className="cupom-card__economia">
                Economize{" "}
                <strong>{formatarDinheiro(cupom.descontoCalculado)}</strong>
              </p>
            </div>

            <button
              type="button"
              disabled={aplicando}
              onClick={() => {
                setCodigo(cupom.codigo);

                void aplicarCodigo(cupom.codigo);
              }}
            >
              Usar cupom
            </button>
          </article>
        ))}

        {quaseDisponiveis.length > 0 && (
          <div className="cupom-carrinho__quase">
            <h4>Você está quase lá</h4>

            {quaseDisponiveis.map((cupom) => (
              <article
                key={cupom.codigo}
                className="cupom-card cupom-card--bloqueado"
              >
                <div>
                  <strong className="cupom-card__codigo">{cupom.codigo}</strong>

                  <p>{descricaoDesconto(cupom.tipoDesconto, cupom.valor)}</p>

                  <small>
                    Pedido mínimo: {formatarDinheiro(cupom.pedidoMinimo)}
                  </small>

                  <p>
                    Faltam{" "}
                    <strong>{formatarDinheiro(cupom.faltanteParaUsar)}</strong>{" "}
                    para usar
                  </p>
                </div>

                <button type="button" disabled>
                  Indisponível
                </button>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
