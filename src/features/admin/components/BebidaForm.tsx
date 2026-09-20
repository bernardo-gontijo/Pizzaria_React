import { useRef, useState, type FormEvent } from "react";
import type { Bebida } from "../../loja/types/bebidas";
import { comprimirImagem } from "../../../utils/imagem";

export type BebidaFormData = Omit<Bebida, "id">;

interface BebidaFormProps {
  bebida?: Bebida;
  onSubmit: (dados: BebidaFormData) => void;
  onCancel?: () => void;
}

// Limite do arquivo ORIGINAL escolhido pelo admin, antes da compressão
// (ver comprimirImagem em utils/imagem.ts) — generoso o bastante para
// cobrir fotos comuns de celular. O que importa de verdade é o
// tamanho final após a compressão.
const TAMANHO_MAXIMO_ARQUIVO_ORIGINAL_BYTES = 10 * 1024 * 1024; // 10 MB

export function BebidaForm({ bebida, onSubmit, onCancel }: BebidaFormProps) {
  const [nome, setNome] = useState(bebida?.nome ?? "");

  const [descricao, setDescricao] = useState(bebida?.descricao ?? "");

  const [preco, setPreco] = useState(bebida ? String(bebida.preco) : "");

  const [quantidade, setQuantidade] = useState(bebida?.quantidade ?? "");

  const [imagem, setImagem] = useState(bebida?.imagem ?? "");
  const [erroImagem, setErroImagem] = useState<string | null>(null);
  const [carregandoImagem, setCarregandoImagem] = useState(false);
  const inputArquivoRef = useRef<HTMLInputElement>(null);

  const [categoria, setCategoria] = useState(bebida?.categoria ?? "");

  const [disponivel, setDisponivel] = useState(bebida?.disponivel ?? true);

  function limparFormulario() {
    setNome("");
    setDescricao("");
    setPreco("");
    setQuantidade("");
    setImagem("");
    setErroImagem(null);
    setCategoria("");
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

    const dados: BebidaFormData = {
      nome,
      descricao,
      preco: Number(preco),
      quantidade,
      imagem,
      categoria,
      disponivel,
    };

    onSubmit(dados);

    if (!bebida) {
      limparFormulario();
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>{bebida ? "Editar bebida" : "Cadastrar bebida"}</h2>

      <div>
        <label htmlFor="bebida-nome">Nome</label>

        <input
          id="bebida-nome"
          type="text"
          value={nome}
          onChange={(event) => setNome(event.target.value)}
          required
        />
      </div>

      <div>
        <label htmlFor="bebida-descricao">Descrição</label>

        <textarea
          id="bebida-descricao"
          value={descricao}
          onChange={(event) => setDescricao(event.target.value)}
          required
        />
      </div>

      <div>
        <label htmlFor="bebida-preco">Preço</label>

        <input
          id="bebida-preco"
          type="number"
          min="0"
          step="0.01"
          value={preco}
          onChange={(event) => setPreco(event.target.value)}
          required
        />
      </div>

      <div>
        <label htmlFor="bebida-quantidade">Quantidade</label>

        <input
          id="bebida-quantidade"
          type="text"
          value={quantidade}
          onChange={(event) => setQuantidade(event.target.value)}
          placeholder="350ml, 600ml, 1L..."
          required
        />
      </div>

      <div className="configuracao-logo">
        <label htmlFor="bebida-imagem">Imagem da bebida</label>

        <div className="configuracao-logo__linha">
          {imagem ? (
            <img
              src={imagem}
              alt="Pré-visualização da imagem da bebida"
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
            id="bebida-imagem"
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
        <label htmlFor="bebida-categoria">Categoria</label>

        <input
          id="bebida-categoria"
          type="text"
          value={categoria}
          onChange={(event) => setCategoria(event.target.value)}
          placeholder="refrigerante, suco, água..."
          required
        />
      </div>

      <div>
        <label>
          <input
            type="checkbox"
            checked={disponivel}
            onChange={(event) => setDisponivel(event.target.checked)}
          />
          Bebida disponível
        </label>
      </div>

      <button type="submit">
        {bebida ? "Salvar alterações" : "Cadastrar bebida"}
      </button>

      {bebida && onCancel && (
        <button type="button" onClick={onCancel}>
          Cancelar
        </button>
      )}
    </form>
  );
}