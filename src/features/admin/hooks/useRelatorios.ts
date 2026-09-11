import { useCallback, useEffect, useMemo, useState } from "react";

import {
  buscarFaturamentoPorPeriodo,
  buscarFormasPagamento,
  buscarProdutosMaisVendidos,
  buscarResumoPeriodo,
  type FormaPagamentoResumo,
  type PontoFaturamento,
  type ProdutoMaisVendido,
  type ResumoPeriodo,
} from "../api/relatorios.service";

export type PresetPeriodo = "dia" | "semana" | "mes" | "personalizado";

function formatarData(data: Date): string {
  return data.toISOString().slice(0, 10);
}

function calcularPeriodo(preset: PresetPeriodo, inicioCustom: string, fimCustom: string) {
  const hoje = new Date();
  const hojeStr = formatarData(hoje);

  if (preset === "dia") {
    return { inicio: hojeStr, fim: hojeStr };
  }

  if (preset === "semana") {
    const seteDiasAtras = new Date(hoje);
    seteDiasAtras.setDate(hoje.getDate() - 6);
    return { inicio: formatarData(seteDiasAtras), fim: hojeStr };
  }

  if (preset === "mes") {
    const primeiroDiaMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    return { inicio: formatarData(primeiroDiaMes), fim: hojeStr };
  }

  return { inicio: inicioCustom, fim: fimCustom };
}

export function useRelatorios() {
  const hoje = useMemo(() => formatarData(new Date()), []);

  const [preset, setPreset] = useState<PresetPeriodo>("mes");
  const [inicioCustom, setInicioCustom] = useState(hoje);
  const [fimCustom, setFimCustom] = useState(hoje);

  const [resumo, setResumo] = useState<ResumoPeriodo | null>(null);
  const [faturamentoDiario, setFaturamentoDiario] = useState<PontoFaturamento[]>(
    [],
  );
  const [produtos, setProdutos] = useState<ProdutoMaisVendido[]>([]);
  const [formasPagamento, setFormasPagamento] = useState<FormaPagamentoResumo[]>(
    [],
  );

  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const periodo = useMemo(
    () => calcularPeriodo(preset, inicioCustom, fimCustom),
    [preset, inicioCustom, fimCustom],
  );

  const carregar = useCallback(async () => {
    if (preset === "personalizado" && (!periodo.inicio || !periodo.fim)) {
      return;
    }

    if (periodo.inicio && periodo.fim && periodo.inicio > periodo.fim) {
      setErro("A data inicial não pode ser depois da data final.");
      return;
    }

    try {
      setCarregando(true);
      setErro(null);

      const [resumoDados, faturamentoDados, produtosDados, pagamentosDados] =
        await Promise.all([
          buscarResumoPeriodo(periodo),
          buscarFaturamentoPorPeriodo(periodo, "dia"),
          buscarProdutosMaisVendidos(periodo, 5),
          buscarFormasPagamento(periodo),
        ]);

      setResumo(resumoDados);
      setFaturamentoDiario(faturamentoDados);
      setProdutos(produtosDados);
      setFormasPagamento(pagamentosDados);
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível carregar os relatórios",
      );
    } finally {
      setCarregando(false);
    }
  }, [preset, periodo]);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  return {
    preset,
    setPreset,
    inicioCustom,
    setInicioCustom,
    fimCustom,
    setFimCustom,
    periodo,
    resumo,
    faturamentoDiario,
    produtos,
    formasPagamento,
    carregando,
    erro,
    recarregar: carregar,
  };
}