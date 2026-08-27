import type { TenantConfig } from '../../loja/types/tenant';

export async function salvarConfiguracao(config: TenantConfig): Promise<TenantConfig> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  localStorage.setItem('tenant-config', JSON.stringify(config));
  return config;
}