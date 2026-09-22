import { useRef, useState, type FormEvent } from "react";
import type { Pizza, PizzaCategory } from "../../loja/types/pizza";
import { comprimirImagem } from "../../../utils/imagem";

export type PizzaFormData = Omit<Pizza, "id">;

interface PizzaFormProps {
  pizza?: Pizza;
  onSubmit: (dados: PizzaFormData) => void;
  onCancel?: () => void;
}

// Limite do arquivo ORIGINAL escolhido pelo admin, antes da compressão
// (ver comprimirImagem em utils/imagem.ts) — generoso o bastante para
// cobrir fotos comuns de celular. O que importa de verdade é o
// tamanho final após a compressão.
const TAMANHO_MAXIMO_ARQUIVO_ORIGINAL_BYTES = 10 * 1024 * 1024; // 10 MB

export function PizzaForm({ pizza, onSubmit, onCancel }: PizzaFormProps) {
  const [nome, setNome] = useState(pizza?.nome ?? "");

  const [descricao, setDescricao] = useState(pizza?.descricao ?? "");

  const [preco, setPreco] = useState(pizza ? String(pizza.preco) : "");

  const [ingredientes, setIngredientes] = useState(
    pizza?.ingredientes.join(", ") ?? "",
  );

  const [imagem, setImagem] = useState(pizza?.imagem ?? "");
  const [erroImagem, setErroImagem] = useState<string | null>(null);
  const [carregandoImagem, setCarregandoImagem] = useState(false);
  const inputArquivoRef = useRef<HTMLInputElement>(null);

  const [categoria, setCategoria] = useState<PizzaCategory>(
    pizza?.categoria ?? "tradicional",
  );

  const [disponivel, setDisponivel] = useState(pizza?.disponivel ?? true);

  function limparFormulario() {
    setNome("");
    setDescricao("");
    setPreco("");
    setIngredientes("");
    setImagem("");
    setErroImagem(null);
    setCategoria("tradicional");
    setDisponivel(true);
  }

  function aoEscolherArquivo(event: React.ChangeEvent<HTMLInputElement>) {
    const arquivo = event.target.files?.[0];
    event.target.value = ""; // permite escolher o mesmo arquivo de novo

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
      tamanhoMaximoBytes: 350 * 1024, // 350 KB
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

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const dados: PizzaFormData = {
      nome,
      descricao,
      preco: Number(preco),

      ingredientes: ingredientes
        .split(",")
        .map((ingrediente) => ingrediente.trim())
        .filter(Boolean),

      imagem,
      categoria,
      disponivel,
    };

    onSubmit(dados);

    if (!pizza) {
      limparFormulario();
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>{pizza ? "Editar pizza" : "Cadastrar pizza"}</h2>

      <div>
        <label htmlFor="nome">Nome</label>

        <input
          id="nome"
          type="text"
          value={nome}
          onChange={(event) => setNome(event.target.value)}
          required
        />
      </div>

      <div>
        <label htmlFor="descricao">Descrição</label>

        <textarea
          id="descricao"
          value={descricao}
          onChange={(event) => setDescricao(event.target.value)}
          required
        />
      </div>

      <div>
        <label htmlFor="preco">Preço</label>

        <input
          id="preco"
          type="number"
          min="0"
          step="0.01"
          value={preco}
          onChange={(event) => setPreco(event.target.value)}
          required
        />
      </div>

      <div>
        <label htmlFor="ingredientes">Ingredientes</label>

        <input
          id="ingredientes"
          type="text"
          value={ingredientes}
          onChange={(event) => setIngredientes(event.target.value)}
          placeholder="Queijo, tomate, calabresa"
          required
        />
      </div>

      <div className="configuracao-logo">
        <label htmlFor="imagem">Imagem da pizza</label>

        <div className="configuracao-logo__linha">
          {imagem ? (
            <img
              src={imagem}
              alt="Pré-visualização da imagem da pizza"
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
            id="imagem"
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

        <details className="configuracao-logo__url-manual">
          <summary>Ou informar uma URL de imagem</summary>

          <input
            type="text"
            value={imagem}
            onChange={(event) => setImagem(event.target.value)}
            placeholder="https://exemplo.com/imagem.png"
          />
        </details>
      </div>

      <div>
        <label htmlFor="categoria">Categoria</label>

        <select
          id="categoria"
          value={categoria}
          onChange={(event) =>
            setCategoria(event.target.value as PizzaCategory)
          }
        >
          <option value="tradicional">Tradicional</option>

          <option value="especial">Especial</option>

          <option value="vegetariana">Vegetariana</option>

          <option value="doce">Doce</option>
        </select>
      </div>

      <div>
        <label>
          <input
            type="checkbox"
            checked={disponivel}
            onChange={(event) => setDisponivel(event.target.checked)}
          />
          Pizza disponível
        </label>
      </div>

      <button type="submit">
        {pizza ? "Salvar alterações" : "Cadastrar pizza"}
      </button>

      {pizza && onCancel && (
        <button type="button" onClick={onCancel}>
          Cancelar
        </button>
      )}
    </form>
  );
}