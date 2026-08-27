import { useState } from "react";
import { useCart } from "../../../context/CartContext";
import { criarPedido } from "../api/pedidos.service";

interface DadosPedido {
    nome: string;
    telefone: string;
    endereco: string;
    formaPagamento: 'dinheiro' | 'cartao_credito' | 'cartao_debito' | 'pix' | 'vale_refeicao' | string;
}

export function usePedido() {
    const { items, limparCarrinho, subtotal } = useCart();
    const [pedido, setPedido] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [erro, setErro] = useState<string | null>(null);

    async function finalizar(dados: DadosPedido) {
        try {
            setLoading(true);
            setErro(null);

            if (items.length === 0) {
                throw new Error("Carrinho vazio");
            }

            const novoPedido = await criarPedido({
                cliente: {
                    nome: dados.nome,
                    telefone: dados.telefone,
                },
                endereco: {
                    rua: dados.endereco,
                    numero: "0",
                    bairro: "",
                    cidade: "",
                    estado: "",
                    cep: "",
                },
                itens: items.map((item: any) => ({
                    pizzaId: item.id,
                    pizzaName: item.nome,
                    quantity: item.quantidade,
                    price: item.precoUnitario,
                    size: item.tamanho || "M",
                })),
                formaPagamento: dados.formaPagamento as any,
            });

            limparCarrinho();
            setPedido(novoPedido);
            return novoPedido;

        } catch (error: any) {
            setErro(error.message || "Erro ao finalizar pedido");
            return null;
        } finally {
            setLoading(false);
        }
    }

    return { pedido, loading, erro, finalizar };
}