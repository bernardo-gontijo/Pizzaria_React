import { useState, type FormEvent } from "react";
import type { Pizza, PizzaCategory } from "../../loja/types/pizza";

export type PizzaFormData = Omit<Pizza, "id">;

interface PizzaFormProps {
  pizza?: Pizza;
  onSubmit: (dados: PizzaFormData) => void;
  onCancel?: () => void;
}

export function PizzaForm({ pizza, onSubmit, onCancel }: PizzaFormProps) {
  const [nome, setNome] = useState(pizza?.nome ?? "");

  const [descricao, setDescricao] = useState(pizza?.descricao ?? "");

  const [preco, setPreco] = useState(pizza ? String(pizza.preco) : "");

  const [ingredientes, setIngredientes] = useState(
    pizza?.ingredientes.join(", ") ?? "",
  );

  const [imagem, setImagem] = useState(pizza?.imagem ?? "");

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
    setCategoria("tradicional");
    setDisponivel(true);
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

      <div>
        <label htmlFor="imagem">URL da imagem</label>

        <input
          id="imagem"
          type="text"
          value={imagem}
          onChange={(event) => setImagem(event.target.value)}
        />
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
