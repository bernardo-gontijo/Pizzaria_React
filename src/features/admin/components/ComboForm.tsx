import { useEffect, useRef, useState } from "react";

import { buscarPizzas } from "../../loja/api/loja.service";
import { buscarBebidas } from "../../loja/api/bebidas.service";
import { comprimirImagem } from "../../../utils/imagem";
import type { Pizza } from "../../loja/types/pizza";
import type { Bebida } from "../../loja/types/bebidas";
import type { Combo, ComboItemRef } from "../../loja/types/combos";
import type { ComboInput } from "../../loja/api/combos.service";

interface ComboFormProps {
  combo?: Combo;
  onSubmit: (dados: ComboInput) => void;
  onCancel?: () => void;
}

// Limite do arquivo ORIGINAL escolhido pelo admin, antes da compressão
// (ver comprimirImagem em utils/imagem.ts). Generoso o bastante para
// cobrir fotos comuns de celular — o que importa de verdade é o
// tamanho final após a compressão, já pensado para caber com folga no
// localStorage (onde o combo é persistido como data URL/base64).
const TAMANHO_MAXIMO_ARQUIVO_ORIGINAL_BYTES = 10 * 1024 * 1024; // 10 MB

function itemEstaSelecionado(itens: ComboItemRef[], tipo: string, id: string) {
  return itens.some((item) => item.tipo === tipo && item.id === id);
}

export function ComboForm({ combo, onSubmit, onCancel }: ComboFormProps) {
  const [pizzas, setPizzas] = useState<Pizza[]>([]);
  const [bebidas, setBebidas] = useState<Bebida[]>([]);
  const [carregandoCatalogo, setCarregandoCatalogo] = useState(true);

  const [nome, setNome] = useState(combo?.nome ?? "");
  const [descricao, setDescricao] = useState(combo?.descricao ?? "");
  const [itens, setItens] = useState<ComboItemRef[]>(combo?.itens ?? []);
  const [imagem, setImagem] = useState(combo?.imagem ?? "");
  const [erroImagem, setErroImagem] = useState<string | null>(null);
  const [carregandoImagem, setCarregandoImagem] = useState(false);
  const inputArquivoRef = useRef<HTMLInputElement>(null);
  const [descontoPercentual, setDescontoPercentual] = useState(
    combo ? String(combo.descontoPercentual) : "10",
  );
  const [disponivel, setDisponivel] = useState(combo?.disponivel ?? true);

  useEffect(() => {
    async function carregarCatalogo() {
      try {
        setCarregandoCatalogo(true);
        const [pizzasCarregadas, bebidasCarregadas] = await Promise.all([
          buscarPizzas(),
          buscarBebidas(),
        ]);
        setPizzas(pizzasCarregadas.filter((pizza) => pizza.disponivel));
        setBebidas(bebidasCarregadas.filter((bebida) => bebida.disponivel));
      } finally {
        setCarregandoCatalogo(false);
      }
    }

    void carregarCatalogo();
  }, []);

  function alternarItem(tipo: "pizza" | "bebida", id: string) {
    setItens((atual) => {
      const jaSelecionado = itemEstaSelecionado(atual, tipo, id);

      if (jaSelecionado) {
        return atual.filter((item) => !(item.tipo === tipo && item.id === id));
      }

      return [...atual, { tipo, id, quantidade: 1 }];
    });
  }

  function alterarQuantidade(
    tipo: "pizza" | "bebida",
    id: string,
    quantidade: number,
  ) {
    setItens((atual) =>
      atual.map((item) =>
        item.tipo === tipo && item.id === id
          ? { ...item, quantidade: Math.max(1, quantidade) }
          : item,
      ),
    );
  }

  function aoEscolherArquivo(evento: React.ChangeEvent<HTMLInputElement>) {
    const arquivo = evento.target.files?.[0];
    evento.target.value = ""; // permite escolher o mesmo arquivo de novo

    if (!arquivo) return;

    setErroImagem(null);

    if (!arquivo.type.startsWith("image/")) {
      setErroImagem("Escolha um arquivo de imagem (PNG, JPG...).");
      return;
    }

    if (arquivo.size > TAMANHO_MAXIMO_ARQUIVO_ORIGINAL_BYTES) {
      setErroImagem(
        `Arquivo muito grande. O limite é ${(
          TAMANHO_MAXIMO_ARQUIVO_ORIGINAL_BYTES /
          1024 /
          1024
        ).toFixed(0)} MB.`,
      );
      return;
    }

    setCarregandoImagem(true);

    comprimirImagem(arquivo, {
      larguraMaxima: 1000,
      alturaMaxima: 1000,
      tamanhoMaximoBytes: 350 * 1024, // 350 KB — combo aparece em cards maiores que o logo
    })
      .then((dataUrlComprimida) => {
        setImagem(dataUrlComprimida);
      })
      .catch((erro: unknown) => {
        setErroImagem(
          erro instanceof Error
            ? erro.message
            : "Não foi possível processar essa imagem. Tente outro arquivo.",
        );
      })
      .finally(() => {
        setCarregandoImagem(false);
      });
  }

  function removerImagem() {
    setImagem("");
    setErroImagem(null);
  }

  function handleSubmit(evento: React.FormEvent) {
    evento.preventDefault();

    const descontoConvertido = Number(descontoPercentual);

    if (
      !nome ||
      itens.length === 0 ||
      Number.isNaN(descontoConvertido) ||
      descontoConvertido < 0 ||
      descontoConvertido > 100
    ) {
      return;
    }

    onSubmit({
      nome,
      descricao: descricao || undefined,
      itens,
      imagem: imagem || undefined,
      descontoPercentual: descontoConvertido,
      disponivel,
    });

    if (!combo) {
      setNome("");
      setDescricao("");
      setItens([]);
      setImagem("");
      setErroImagem(null);
      setDescontoPercentual("10");
      setDisponivel(true);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>{combo ? "Editar combo" : "Cadastrar combo"}</h2>

      <div>
        <label htmlFor="combo-nome">Nome do combo</label>
        <input
          id="combo-nome"
          type="text"
          value={nome}
          onChange={(evento) => setNome(evento.target.value)}
          required
        />
      </div>

      <div>
        <label htmlFor="combo-descricao">Descrição (opcional)</label>
        <textarea
          id="combo-descricao"
          value={descricao}
          onChange={(evento) => setDescricao(evento.target.value)}
        />
      </div>

      <div className="configuracao-logo">
        <p className="mb-1 font-medium">Imagem do combo</p>

        <div className="configuracao-logo__linha">
          {imagem ? (
            <img
              src={imagem}
              alt="Pré-visualização da imagem do combo"
              className="configuracao-logo__preview"
            />
          ) : (
            <span className="configuracao-logo__preview configuracao-logo__preview--vazia">
              Sem imagem
            </span>
          )}

          <div className="configuracao-logo__acoes">
            <button
              type="button"
              onClick={() => inputArquivoRef.current?.click()}
              disabled={carregandoImagem}
              className="rounded border px-3 py-2 font-semibold"
            >
              {carregandoImagem ? "Carregando..." : "Carregar imagem"}
            </button>

            {imagem && (
              <button
                type="button"
                onClick={removerImagem}
                className="configuracao-logo__remover"
              >
                Remover
              </button>
            )}
          </div>

          <input
            ref={inputArquivoRef}
            type="file"
            accept="image/*"
            onChange={aoEscolherArquivo}
            className="configuracao-logo__input-arquivo"
          />
        </div>

        {erroImagem && (
          <p className="configuracao-logo__erro" role="alert">
            {erroImagem}
          </p>
        )}

        <small>
          Se nenhuma imagem for definida, a loja usa a foto do primeiro
          item do combo como capa.
        </small>

        <details className="configuracao-logo__url-manual">
          <summary>Ou informar uma URL de imagem</summary>

          <input
            type="text"
            value={imagem}
            onChange={(evento) => setImagem(evento.target.value)}
            placeholder="https://exemplo.com/imagem.png"
          />
        </details>
      </div>

      <fieldset>
        <legend>Pizzas incluídas</legend>

        {carregandoCatalogo && <p>Carregando cardápio...</p>}

        {!carregandoCatalogo &&
          pizzas.map((pizza) => {
            const selecionado = itemEstaSelecionado(itens, "pizza", pizza.id);
            const itemAtual = itens.find(
              (item) => item.tipo === "pizza" && item.id === pizza.id,
            );

            return (
              <div key={pizza.id}>
                <label>
                  <input
                    type="checkbox"
                    checked={selecionado}
                    onChange={() => alternarItem("pizza", pizza.id)}
                  />
                  {pizza.nome} — R$ {pizza.preco.toFixed(2).replace(".", ",")}
                </label>

                {selecionado && (
                  <input
                    type="number"
                    min="1"
                    aria-label={`Quantidade de ${pizza.nome}`}
                    value={itemAtual?.quantidade ?? 1}
                    onChange={(evento) =>
                      alterarQuantidade(
                        "pizza",
                        pizza.id,
                        Number(evento.target.value),
                      )
                    }
                  />
                )}
              </div>
            );
          })}
      </fieldset>

      <fieldset>
        <legend>Bebidas incluídas</legend>

        {!carregandoCatalogo &&
          bebidas.map((bebida) => {
            const selecionado = itemEstaSelecionado(itens, "bebida", bebida.id);
            const itemAtual = itens.find(
              (item) => item.tipo === "bebida" && item.id === bebida.id,
            );

            return (
              <div key={bebida.id}>
                <label>
                  <input
                    type="checkbox"
                    checked={selecionado}
                    onChange={() => alternarItem("bebida", bebida.id)}
                  />
                  {bebida.nome} — R$ {bebida.preco.toFixed(2).replace(".", ",")}
                </label>

                {selecionado && (
                  <input
                    type="number"
                    min="1"
                    aria-label={`Quantidade de ${bebida.nome}`}
                    value={itemAtual?.quantidade ?? 1}
                    onChange={(evento) =>
                      alterarQuantidade(
                        "bebida",
                        bebida.id,
                        Number(evento.target.value),
                      )
                    }
                  />
                )}
              </div>
            );
          })}
      </fieldset>

      <div>
        <label htmlFor="combo-desconto">Desconto (%)</label>
        <input
          id="combo-desconto"
          type="number"
          min="0"
          max="100"
          value={descontoPercentual}
          onChange={(evento) => setDescontoPercentual(evento.target.value)}
          required
        />
        <small>
          Percentual aplicado sobre a soma dos preços reais dos itens
          selecionados. O preço final é sempre calculado automaticamente.
        </small>
      </div>

      <div>
        <label>
          <input
            type="checkbox"
            checked={disponivel}
            onChange={(evento) => setDisponivel(evento.target.checked)}
          />
          Combo disponível
        </label>
      </div>

      <button type="submit">
        {combo ? "Salvar alterações" : "Cadastrar combo"}
      </button>

      {combo && onCancel && (
        <button type="button" onClick={onCancel}>
          Cancelar edição
        </button>
      )}
    </form>
  );
}