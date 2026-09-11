import type { EnderecoEntrega, ItemPedido } from "../types/pedido";
import { formatarEndereco } from "../utils/endereco";

interface ItensPedidoProps {
  pedido: {
    itens: ItemPedido[];
    subtotal: number;
    taxaEntrega: number;
    desconto: number;
    total: number;
    formaPagamento: string;
    trocoPara?: number;
    observacoes?: string;
    endereco?: Partial<EnderecoEntrega>;
    mesaId?: string;
  };
}

const NOMES_FORMA_PAGAMENTO: Record<string, string> = {
  dinheiro: "Dinheiro",
  cartao_credito: "Cartão de crédito",
  cartao_debito: "Cartão de débito",
  pix: "Pix",
  vale_refeicao: "Vale-refeição",
};

function formatarMoeda(valor: number): string {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function ItensPedido({ pedido }: ItensPedidoProps) {
  return (
    <div className="itens-pedido">
      <h2 className="itens-pedido__titulo">Itens do pedido</h2>

      <ul className="itens-pedido__lista">
        {pedido.itens.map((item) => (
          <li key={item.id} className="itens-pedido__item">
            <div className="itens-pedido__item-descricao">
              <strong>
                {item.quantity}x {item.pizzaName}
              </strong>
              {item.size && <span>Tamanho {item.size}</span>}
              {item.observations && <span>Obs.: {item.observations}</span>}
            </div>
            <span className="itens-pedido__item-preco">
              {formatarMoeda(item.price * item.quantity)}
            </span>
          </li>
        ))}
      </ul>

      <div className="itens-pedido__totais">
        <p>
          <span>Subtotal</span>
          <span>{formatarMoeda(pedido.subtotal)}</span>
        </p>
        <p>
          <span>Taxa de entrega</span>
          <span>{formatarMoeda(pedido.taxaEntrega)}</span>
        </p>
        {pedido.desconto > 0 && (
          <p>
            <span>Desconto</span>
            <span>-{formatarMoeda(pedido.desconto)}</span>
          </p>
        )}
        <p className="itens-pedido__totais-final">
          <span>Total</span>
          <span>{formatarMoeda(pedido.total)}</span>
        </p>
      </div>

      <div className="itens-pedido__info">
        <p>
          <strong>Forma de pagamento:</strong>{" "}
          {NOMES_FORMA_PAGAMENTO[pedido.formaPagamento] ??
            pedido.formaPagamento}
          {typeof pedido.trocoPara === "number" &&
            ` (troco para ${formatarMoeda(pedido.trocoPara)})`}
        </p>

        {pedido.mesaId ? (
          <p>
            <strong>Mesa:</strong> {pedido.mesaId}
          </p>
        ) : (
          <p>
            <strong>Endereço de entrega:</strong>{" "}
            {formatarEndereco(pedido.endereco)}
          </p>
        )}

        {pedido.observacoes && (
          <p>
            <strong>Observações:</strong> {pedido.observacoes}
          </p>
        )}
      </div>
    </div>
  );
}