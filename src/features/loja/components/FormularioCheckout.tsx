import { useState } from "react";

interface FormularioCheckoutProps {
  onSubmit: (dados: {
    nome: string;
    telefone: string;
    endereco: string;
    formaPagamento: string;
  }) => void;
  loading?: boolean;
  erro?: string | null;
}

export function FormularioCheckout({
  onSubmit,
  loading = false,
  erro = null,
}: FormularioCheckoutProps) {
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [endereco, setEndereco] = useState("");
  const [pagamento, setPagamento] = useState("pix");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({ nome, telefone, endereco, formaPagamento: pagamento });
  }

  return (
    <form className="formulario-checkout" onSubmit={handleSubmit}>
      {erro && <p className="erro">{erro}</p>}

      <div className="formulario-checkout__campo">
        <label htmlFor="nome">Nome *</label>
        <input
          id="nome"
          type="text"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          disabled={loading}
          required
        />
      </div>

      <div className="formulario-checkout__campo">
        <label htmlFor="telefone">Telefone *</label>
        <input
          id="telefone"
          type="tel"
          value={telefone}
          onChange={(e) => setTelefone(e.target.value)}
          disabled={loading}
          required
        />
      </div>

      <div className="formulario-checkout__campo">
        <label htmlFor="endereco">Endereço *</label>
        <input
          id="endereco"
          type="text"
          value={endereco}
          onChange={(e) => setEndereco(e.target.value)}
          disabled={loading}
          required
        />
      </div>

      <div className="formulario-checkout__campo">
        <label htmlFor="pagamento">Pagamento *</label>
        <select
          id="pagamento"
          value={pagamento}
          onChange={(e) => setPagamento(e.target.value)}
          disabled={loading}
        >
          <option value="pix">PIX</option>
          <option value="cartao_credito">Cartão de Crédito</option>
          <option value="cartao_debito">Cartão de Débito</option>
          <option value="dinheiro">Dinheiro</option>
        </select>
      </div>

      <button
        className="formulario-checkout__botao"
        type="submit"
        disabled={loading}
      >
        {loading ? "Processando..." : "Finalizar Pedido"}
      </button>
    </form>
  );
}
