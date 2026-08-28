import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import type { TenantConfig } from "../features/loja/types/tenant";

interface TenantConfigContextData {
  config: TenantConfig;
  atualizarConfig: (config: TenantConfig) => void;
}

const configInicial: TenantConfig = {
  id: "pizzaria-demo",
  nome: "Pizzaria Callidus",
  logoUrl: "",
  corPrimaria: "#e63946",
  corSecundaria: "#1d3557",
  endereco: "Rua Principal, 100",
  horarioFuncionamento: "18:00 às 23:00",
  taxaEntrega: 5,
  raioEntregaKm: 10,
  tempoMedioPreparoMin: 40,
  formasPagamentoHabilitadas: ["pix", "cartao", "dinheiro"],
};

const TenantConfigContext = createContext<TenantConfigContextData | undefined>(
  undefined,
);

function carregarConfiguracao() {
  const configuracaoSalva = localStorage.getItem("tenant-config");

  if (!configuracaoSalva) return configInicial;

  try {
    const config = JSON.parse(configuracaoSalva) as TenantConfig;

    // Atualiza apenas a identidade padrão que ficou salva antes da mudança de nome.
    if (config.id === "pizzaria-demo" && config.nome === "Pizzaria Callidus") {
      return { ...config, nome: configInicial.nome };
    }

    return config;
  } catch {
    return configInicial;
  }
}

export function TenantConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<TenantConfig>(carregarConfiguracao);

  useEffect(() => {
    localStorage.setItem("tenant-config", JSON.stringify(config));

    document.documentElement.style.setProperty(
      "--cor-primaria",
      config.corPrimaria,
    );

    document.documentElement.style.setProperty(
      "--cor-secundaria",
      config.corSecundaria,
    );
  }, [config]);

  function atualizarConfig(novaConfig: TenantConfig) {
    setConfig(novaConfig);
  }

  return (
    <TenantConfigContext.Provider
      value={{
        config,
        atualizarConfig,
      }}
    >
      {children}
    </TenantConfigContext.Provider>
  );
}

export function useTenantConfig() {
  const context = useContext(TenantConfigContext);

  if (!context) {
    throw new Error(
      "useTenantConfig deve ser utilizado dentro de TenantConfigProvider",
    );
  }

  return context;
}
