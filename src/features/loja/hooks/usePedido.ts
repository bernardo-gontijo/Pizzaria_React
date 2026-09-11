import { useState } from "react";

import { useCart } from "../../../context/CartContext";
import { criarPedidoCliente } from "../api/pedidosCliente.service";
import { useClienteAuth } from "./ClienteAuthContext";

import type { CriarPedidoDTO, DadosCheckout, Pedido } from "../types/pedido";

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
  const { items, limparCarrinho, cupomAplicado } = useCart();

  const { usuario } = useClienteAuth();

  const [pedido, setPedido] = useState<Pedido | null>(null);

  const [loading, setLoading] = useState(false);

  const [erro, setErro] = useState<string | null>(null);

  async function finalizar(dados: DadosCheckout) {
    try {
      setLoading(true);
      setErro(null);

      if (!usuario) {
        throw new Error(
          "Você precisa entrar na sua conta para fazer o pedido.",
        );
      }

      if (items.length === 0) {
        throw new Error("Carrinho vazio");
      }

      const novoPedido = await criarPedidoCliente({
        cliente: {
          nome: dados.nome,
          email: usuario.email,
          telefone: dados.telefone,
        },

        endereco: dados.endereco,

        itens: items.map((item) => ({
          tipo: item.tipo ?? "pizza",

          pizzaId: item.id,

          pizzaName: item.nome,

          quantity: item.quantidade,

          price: item.precoUnitario,

          size:
            item.tipo === "bebida"
              ? undefined
              : (item.tamanho as "P" | "M" | "G" | "GG") || "M",
        })),

        formaPagamento: validarFormaPagamento(dados.formaPagamento),

        cupomCodigo: cupomAplicado?.codigo,
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

  return {
    pedido,
    loading,
    erro,
    finalizar,
  };
}
