import { useState } from "react";
import { useCart } from "../../../context/CartContext";
import { criarPedido } from "../api/pedidos.service";
import type { Pedido, CriarPedidoDTO } from "../types/pedido";

interface DadosPedido {
  nome: string;
  telefone: string;
  endereco: string;
  formaPagamento:
    | "dinheiro"
    | "cartao_credito"
    | "cartao_debito"
    | "pix"
    | "vale_refeicao"
    | string;
}

const FORMAS_PAGAMENTO_VALIDAS: readonly CriarPedidoDTO["formaPagamento"][] = [
  "dinheiro",
  "cartao_credito",
  "cartao_debito",
  "pix",
  "vale_refeicao",
];

function validarFormaPagamento(
  valor: string,
): CriarPedidoDTO["formaPagamento"] {
  if ((FORMAS_PAGAMENTO_VALIDAS as readonly string[]).includes(valor)) {
    return valor as CriarPedidoDTO["formaPagamento"];
  }

  throw new Error(`Forma de pagamento inválida: ${valor}`);
}

export function usePedido() {
  const { items, limparCarrinho } = useCart();
  const [pedido, setPedido] = useState<Pedido | null>(null);
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
        itens: items.map((item) => ({
          pizzaId: item.id,
          pizzaName: item.nome,
          quantity: item.quantidade,
          price: item.precoUnitario,
          size: (item.tamanho as "P" | "M" | "G" | "GG") || "M",
        })),
        formaPagamento: validarFormaPagamento(dados.formaPagamento),
      });

      limparCarrinho();
      setPedido(novoPedido);
      return novoPedido;
    } catch (error) {
      setErro(
        error instanceof Error ? error.message : "Erro ao finalizar pedido",
      );
      return null;
    } finally {
      setLoading(false);
    }
  }

  return { pedido, loading, erro, finalizar };
}
