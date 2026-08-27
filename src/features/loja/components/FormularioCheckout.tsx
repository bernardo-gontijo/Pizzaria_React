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
    erro = null 
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
        <form onSubmit={handleSubmit}>
            {erro && <p className="erro">{erro}</p>}

            <div>
                <label>Nome *</label>
                <input 
                    value={nome} 
                    onChange={(e) => setNome(e.target.value)} 
                    disabled={loading} 
                    required 
                />
            </div>

            <div>
                <label>Telefone *</label>
                <input 
                    value={telefone} 
                    onChange={(e) => setTelefone(e.target.value)} 
                    disabled={loading} 
                    required 
                />
            </div>

            <div>
                <label>Endereço *</label>
                <input 
                    value={endereco} 
                    onChange={(e) => setEndereco(e.target.value)} 
                    disabled={loading} 
                    required 
                />
            </div>

            <div>
                <label>Pagamento *</label>
                <select 
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

            <button type="submit" disabled={loading}>
                {loading ? "Processando..." : "Finalizar Pedido"}
            </button>
        </form>
    );
}