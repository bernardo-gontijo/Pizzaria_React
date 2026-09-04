import { useEffect, useRef, useState } from "react";
import { buscarEnderecoPorCEP } from "../api/cep.service";
import type { DadosCheckout, EnderecoEntrega } from "../types/pedido";

const enderecoInicial: EnderecoEntrega = {
  cep: "",
  rua: "",
  numero: "",
  bairro: "",
  cidade: "",
  estado: "",
  complemento: "",
  referencia: "",
};

const camposEndereco = [
  { campo: "rua", nome: "Rua", obrigatorio: true },
  { campo: "numero", nome: "Número (ou S/N)", obrigatorio: true },
  { campo: "bairro", nome: "Bairro", obrigatorio: true },
  { campo: "cidade", nome: "Cidade", obrigatorio: true },
  { campo: "estado", nome: "UF", obrigatorio: true },
  { campo: "complemento", nome: "Complemento", obrigatorio: false },
  { campo: "referencia", nome: "Ponto de referência", obrigatorio: false },
] as const;

interface FormularioCheckoutProps {
  onSubmit: (dados: DadosCheckout) => void;
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
  const [endereco, setEndereco] = useState<EnderecoEntrega>(enderecoInicial);
  const [consultandoCEP, setConsultandoCEP] = useState(false);
  const [mensagemCEP, setMensagemCEP] = useState("");
  const consultaAtual = useRef<AbortController | null>(null);
  const ultimoCEP = useRef("");
  const [pagamento, setPagamento] = useState("pix");

  useEffect(() => {
    return () => {
      consultaAtual.current?.abort();
      consultaAtual.current = null;
    };
  }, []);

  function alterarCEP(valor: string) {
    const cep = valor.replace(/\D/g, "").slice(0, 8);
    if (cep === endereco.cep) return;
    consultaAtual.current?.abort();
    consultaAtual.current = null;
    ultimoCEP.current = "";
    setConsultandoCEP(false);
    setMensagemCEP("");
    setEndereco({ ...enderecoInicial, cep });
  }

  async function consultarCEP() {
    const cep = endereco.cep;
    if (!/^\d{8}$/.test(cep)) {
      setMensagemCEP("Informe um CEP com 8 dígitos.");
      return;
    }
    if (ultimoCEP.current === cep) return;
    ultimoCEP.current = cep;

    const controller = new AbortController();
    consultaAtual.current = controller;
    setConsultandoCEP(true);
    setMensagemCEP("");
    const limite = window.setTimeout(() => controller.abort(), 8000);

    try {
      const encontrado = await buscarEnderecoPorCEP(cep, controller.signal);
      if (consultaAtual.current !== controller) return;
      setEndereco((atual) => ({ ...atual, ...encontrado }));
      setMensagemCEP(
        "Confira o endereço e informe o número. Você pode corrigir os campos.",
      );
    } catch (error) {
      if (consultaAtual.current !== controller) return;
      const mensagem = controller.signal.aborted
        ? "A consulta demorou mais que o esperado."
        : error instanceof Error
          ? error.message
          : "Não foi possível consultar o CEP.";
      setMensagemCEP(`${mensagem} Preencha o endereço manualmente.`);
    } finally {
      window.clearTimeout(limite);
      if (consultaAtual.current === controller) {
        consultaAtual.current = null;
        setConsultandoCEP(false);
      }
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading || consultandoCEP) return;
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
        <label htmlFor="cep">CEP *</label>
        <input
          id="cep"
          type="text"
          inputMode="numeric"
          autoComplete="postal-code"
          placeholder="00000-000"
          maxLength={9}
          pattern="[0-9]{5}-?[0-9]{3}"
          value={endereco.cep.replace(/^(\d{5})(\d)/, "$1-$2")}
          onChange={(e) => alterarCEP(e.target.value)}
          onBlur={() => void consultarCEP()}
          aria-describedby="cep-mensagem"
          disabled={loading}
          required
        />
        <small id="cep-mensagem" role="status">
          {consultandoCEP ? "Consultando CEP..." : mensagemCEP}
        </small>
      </div>

      {camposEndereco.map(({ campo, nome, obrigatorio }) => (
        <div className="formulario-checkout__campo" key={campo}>
          <label htmlFor={campo}>
            {nome}
            {obrigatorio ? " *" : ""}
          </label>
          <input
            id={campo}
            type="text"
            value={endereco[campo] ?? ""}
            onChange={(e) =>
              setEndereco((atual) => ({
                ...atual,
                [campo]:
                  campo === "estado"
                    ? e.target.value.toUpperCase()
                    : e.target.value,
              }))
            }
            maxLength={campo === "estado" ? 2 : undefined}
            pattern={campo === "estado" ? "[A-Z]{2}" : ".*\\S.*"}
            disabled={loading || consultandoCEP}
            required={obrigatorio}
          />
        </div>
      ))}

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
        disabled={loading || consultandoCEP}
      >
        {loading ? "Processando..." : "Finalizar Pedido"}
      </button>
    </form>
  );
}
