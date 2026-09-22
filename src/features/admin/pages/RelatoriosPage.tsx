import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { useEffect } from "react";

import { DashboardCard } from "../components/DasboardCard";
import { useRelatorios, type PresetPeriodo } from "../hooks/useRelatorios";

const NOMES_FORMA_PAGAMENTO: Record<string, string> = {
  dinheiro: "Dinheiro",
  cartao_credito: "Cartao de credito",
  cartao_debito: "Cartao de debito",
  pix: "Pix",
  vale_refeicao: "Vale-refeicao",
  "nao informado": "Nao informado",
};

const CORES_GRAFICO = [
  "#d9822b",
  "#8a5a44",
  "#4c8577",
  "#c14953",
  "#5b6ea6",
  "#a4a4a4",
];

function nomeFormaPagamento(chave: string): string {
  return NOMES_FORMA_PAGAMENTO[chave] ?? chave;
}

function formatarMoeda(valor: number): string {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function formatarDataCurta(periodo: string): string {
  // "2026-09-10" -> "10/09"
  const partes = periodo.split("-");
  if (partes.length === 3) {
    return `${partes[2]}/${partes[1]}`;
  }
  return periodo;
}

const PRESETS: Array<{ id: PresetPeriodo; rotulo: string }> = [
  { id: "dia", rotulo: "Hoje" },
  { id: "semana", rotulo: "Ultimos 7 dias" },
  { id: "mes", rotulo: "Este mes" },
  { id: "personalizado", rotulo: "Periodo personalizado" },
];

export function RelatoriosPage() {
  const {
    preset,
    setPreset,
    inicioCustom,
    setInicioCustom,
    fimCustom,
    setFimCustom,
    resumo,
    faturamentoDiario,
    produtos,
    formasPagamento,
    carregando,
    erro,
    recarregar,
  } = useRelatorios();

  useEffect(() => {
    void recarregar();
  }, [recarregar]);

  return (
    <main className="relatorios-page">
      <h1>Relatorios</h1>
      <p>Faturamento e metricas de vendas da pizzaria.</p>

      <div className="relatorios-page__periodo">
        {PRESETS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={
              preset === item.id
                ? "relatorios-page__periodo-botao relatorios-page__periodo-botao--ativo"
                : "relatorios-page__periodo-botao"
            }
            onClick={() => setPreset(item.id)}
          >
            {item.rotulo}
          </button>
        ))}

        <button
          type="button"
          className="relatorios-page__periodo-botao"
          onClick={() => void recarregar()}
          disabled={carregando}
        >
          {carregando ? "Atualizando..." : "Atualizar"}
        </button>
      </div>

      {preset === "personalizado" && (
        <div className="relatorios-page__datas">
          <div>
            <label htmlFor="data-inicio">Data inicial</label>
            <input
              id="data-inicio"
              type="date"
              value={inicioCustom}
              max={fimCustom}
              onChange={(e) => setInicioCustom(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="data-fim">Data final</label>
            <input
              id="data-fim"
              type="date"
              value={fimCustom}
              min={inicioCustom}
              onChange={(e) => setFimCustom(e.target.value)}
            />
          </div>
        </div>
      )}

      {erro && <p role="alert">{erro}</p>}

      {carregando && !resumo ? (
        <p>Carregando relatorios...</p>
      ) : (
        resumo && (
          <>
            <section>
              <DashboardCard
                titulo="Faturamento do periodo"
                valor={formatarMoeda(resumo.faturamento)}
              />
              <DashboardCard
                titulo="Ticket medio"
                valor={formatarMoeda(resumo.ticketMedio)}
              />
              <DashboardCard
                titulo="Pedidos no periodo"
                valor={resumo.totalPedidos}
              />
              <DashboardCard
                titulo="Pizza mais vendida"
                valor={resumo.pizzaMaisVendida?.pizza ?? "â€”"}
                descricao={
                  resumo.pizzaMaisVendida
                    ? `${resumo.pizzaMaisVendida.quantidade} unidades`
                    : "Sem vendas no periodo"
                }
              />
              <DashboardCard
                titulo="Forma de pagamento mais usada"
                valor={
                  resumo.formaPagamentoMaisUsada
                    ? nomeFormaPagamento(resumo.formaPagamentoMaisUsada)
                    : "â€”"
                }
              />
            </section>

            <article className="relatorios-page__grafico">
              <h2>Faturamento por dia</h2>
              {faturamentoDiario.length === 0 ? (
                <p>Sem faturamento no periodo selecionado.</p>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={faturamentoDiario}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis
                      dataKey="periodo"
                      tickFormatter={formatarDataCurta}
                      fontSize={12}
                    />
                    <YAxis
                      tickFormatter={(valor: number) => formatarMoeda(valor)}
                      width={90}
                      fontSize={12}
                    />
                    <Tooltip
                      formatter={(valor) => formatarMoeda(Number(valor))}
                      labelFormatter={(periodo) =>
                        formatarDataCurta(String(periodo))
                      }
                    />
                    <Bar
                      dataKey="faturamento"
                      name="Faturamento"
                      fill="#d9822b"
                      radius={[6, 6, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </article>

            <div className="relatorios-page__grid-duplo">
              <article className="relatorios-page__grafico">
                <h2>Produtos mais vendidos</h2>
                {produtos.length === 0 ? (
                  <p>Sem vendas no periodo selecionado.</p>
                ) : (
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={produtos} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                      <XAxis type="number" fontSize={12} allowDecimals={false} />
                      <YAxis
                        dataKey="produto"
                        type="category"
                        width={110}
                        fontSize={12}
                      />
                      <Tooltip
                        formatter={(valor) => `${Number(valor)} unidades`}
                      />
                      <Bar
                        dataKey="quantidade"
                        name="Quantidade vendida"
                        fill="#4c8577"
                        radius={[0, 6, 6, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </article>

              <article className="relatorios-page__grafico">
                <h2>Formas de pagamento</h2>
                {formasPagamento.length === 0 ? (
                  <p>Sem pedidos no periodo selecionado.</p>
                ) : (
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie
                        data={formasPagamento}
                        dataKey="quantidade"
                        nameKey="formaPagamento"
                        outerRadius={100}
                        label={(props: { formaPagamento?: string; percent?: number }) =>
                          `${nomeFormaPagamento(props.formaPagamento ?? "")} (${Math.round(
                            (props.percent ?? 0) * 100,
                          )}%)`
                        }
                      >
                        {formasPagamento.map((_entrada, indice) => (
                          <Cell
                            key={_entrada.formaPagamento}
                            fill={CORES_GRAFICO[indice % CORES_GRAFICO.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(valor, _nome, item) => [
                          `${Number(valor)} pedidos (${formatarMoeda(
                            (item.payload as { faturamento: number }).faturamento,
                          )})`,
                          nomeFormaPagamento(
                            (item.payload as { formaPagamento: string })
                              .formaPagamento,
                          ),
                        ]}
                      />
                      <Legend
                        formatter={(valor: string) => nomeFormaPagamento(valor)}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </article>
            </div>
          </>
        )
      )}
    </main>
  );
}
