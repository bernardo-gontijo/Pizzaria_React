export type PaymentMethod = "pix" | "cartao" | "dinheiro";

export interface TenantConfig {
  id: string;
  nome: string;
  logoUrl: string;
  corPrimaria: string;
  corSecundaria: string;
  endereco: string;
  horarioFuncionamento: string;
  taxaEntrega: number;
  raioEntregaKm: number;
  tempoMedioPreparoMin: number;
  formasPagamentoHabilitadas: PaymentMethod[];
}
