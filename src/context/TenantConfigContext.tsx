import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';

import type { TenantConfig } from '../features/loja/types/tenant';

interface TenantConfigContextData {
  config: TenantConfig;
  atualizarConfig: (config: TenantConfig) => void;
}

const configInicial: TenantConfig = {
  id: 'pizzaria-demo',
  nome: 'PizzaShop',
  logoUrl: '',
  corPrimaria: '#e63946',
  corSecundaria: '#1d3557',
  endereco: 'Rua Principal, 100',
  horarioFuncionamento: '18:00 às 23:00',
  taxaEntrega: 5,
  raioEntregaKm: 10,
  tempoMedioPreparoMin: 40,
  formasPagamentoHabilitadas: [
    'pix',
    'cartao',
    'dinheiro',
  ],
};

const TenantConfigContext =
  createContext<TenantConfigContextData | undefined>(undefined);

export function TenantConfigProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [config, setConfig] = useState<TenantConfig>(() => {
    const saved = localStorage.getItem('tenant-config');

    return saved
      ? JSON.parse(saved) as TenantConfig
      : configInicial;
  });

  useEffect(() => {
    localStorage.setItem(
      'tenant-config',
      JSON.stringify(config),
    );

    document.documentElement.style.setProperty(
      '--cor-primaria',
      config.corPrimaria,
    );

    document.documentElement.style.setProperty(
      '--cor-secundaria',
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
      'useTenantConfig deve ser utilizado dentro de TenantConfigProvider',
    );
  }

  return context;
}