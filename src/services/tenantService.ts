import { api } from './api';
import type { TenantConfig } from '../types/tenant';

export async function buscarTenant(
  id: string,
): Promise<TenantConfig> {
  return api.get<TenantConfig>(`/tenants/${id}`);
}

export async function atualizarTenant(
  id: string,
  config: TenantConfig,
): Promise<TenantConfig> {
  return api.put<TenantConfig>(
    `/tenants/${id}`,
    config,
  );
}