import {
  Bike,
  CheckCircle2,
  ChefHat,
  Clock,
  CreditCard,
  HelpCircle,
  MapPin,
  Package,
  User,
} from "lucide-react";

import { useTenantConfig } from "../../../context/TenantConfigContext";
import type { EnderecoEntrega } from "../types/pedido";
import { formatarEndereco } from "../utils/endereco";

interface StatusPedidoProps {
  pedido: {
    id: string;
    status: string;
    cliente: { nome: string };
    endereco?: Partial<EnderecoEntrega>;
    total: number;
    formaPagamento?: string;
    mesaId?: string;
    createdAt?: Date | string;
  };
}

const STATUS_MAP: Record<string, string> = {
  pendente: "Aguardando",
  confirmado: "Confirmado",
  preparando: "Preparando",
  pronto: "Pronto",
  saiu_para_entrega: "Em rota",
  entregue: "Entregue",
  cancelado: "Cancelado",
};

const NOMES_FORMA_PAGAMENTO: Record<string, string> = {
  dinheiro: "Dinheiro",
  cartao_credito: "Cartão de crédito",
  cartao_debito: "Cartão de débito",
  pix: "Pix",
  vale_refeicao: "Vale-refeição",
};

const ICONE_ETAPA: Record<string, typeof Clock> = {
  pendente: Clock,
  confirmado: CheckCircle2,
  preparando: ChefHat,
  pronto: Package,
  saiu_para_entrega: Bike,
  entregue: HelpCircle,
};

function formatarHora(data: Date): string {
  return data.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function calcularPrevisaoEntrega(
  createdAt: Date | string | undefined,
  tempoMedioPreparoMin: number,
): string | null {
  if (!createdAt) return null;

  const inicio = new Date(createdAt);

  if (Number.isNaN(inicio.getTime())) return null;

  const inicioJanela = new Date(
    inicio.getTime() + tempoMedioPreparoMin * 60_000,
  );

  const fimJanela = new Date(
    inicio.getTime() + (tempoMedioPreparoMin + 15) * 60_000,
  );

  return `${formatarHora(inicioJanela)} - ${formatarHora(fimJanela)}`;
}

export function StatusPedido({ pedido }: StatusPedidoProps) {
  const { config } = useTenantConfig();

  const steps = [
    "pendente",
    "confirmado",
    "preparando",
    "pronto",
    "saiu_para_entrega",
    "entregue",
  ];

  const currentIndex = steps.indexOf(pedido.status);

  const previsaoEntrega = calcularPrevisaoEntrega(
    pedido.createdAt,
    config.tempoMedioPreparoMin,
  );

  return (
    <div className="status-pedido">
      <div className="status-pedido__cabecalho">
        <div>
          <span>Pedido #{pedido.id.slice(-6)}</span>
          <h2>{STATUS_MAP[pedido.status] || pedido.status}</h2>
        </div>

        {previsaoEntrega && (
          <div className="status-pedido__previsao">
            <span>Previsão de entrega</span>
            <strong>{previsaoEntrega}</strong>
          </div>
        )}
      </div>

      <ol className="status-timeline">
        {steps.map((step, index) => {
          const Icone = ICONE_ETAPA[step] ?? HelpCircle;

          return (
            <li
              key={step}
              className={index <= currentIndex ? "completed" : ""}
            >
              <span aria-hidden="true">
                <Icone size={16} />
              </span>
              <span>{STATUS_MAP[step]}</span>
            </li>
          );
        })}
      </ol>

      <div className="status-detalhes">
        <div className="status-detalhes__item">
          <span className="status-detalhes__icone" aria-hidden="true">
            <User size={16} />
          </span>
          <div>
            <dt>Cliente</dt>
            <dd>{pedido.cliente.nome}</dd>
          </div>
        </div>

        {pedido.mesaId ? (
          <div className="status-detalhes__item">
            <span className="status-detalhes__icone" aria-hidden="true">
              <MapPin size={16} />
            </span>
            <div>
              <dt>Mesa</dt>
              <dd>{pedido.mesaId}</dd>
            </div>
          </div>
        ) : (
          pedido.endereco && (
            <div className="status-detalhes__item">
              <span className="status-detalhes__icone" aria-hidden="true">
                <MapPin size={16} />
              </span>
              <div>
                <dt>Endereço de entrega</dt>
                <dd>{formatarEndereco(pedido.endereco)}</dd>
              </div>
            </div>
          )
        )}

        {pedido.formaPagamento && (
          <div className="status-detalhes__item">
            <span className="status-detalhes__icone" aria-hidden="true">
              <CreditCard size={16} />
            </span>
            <div>
              <dt>Pagamento</dt>
              <dd>
                {NOMES_FORMA_PAGAMENTO[pedido.formaPagamento] ??
                  pedido.formaPagamento}
              </dd>
              <strong>
                R${" "}
                {pedido.total.toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                })}
              </strong>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}