import type { EnderecoEntrega } from "../types/pedido";

export function formatarEndereco(endereco?: Partial<EnderecoEntrega>): string {
  if (!endereco) return "Endereço não informado";

  return [
    endereco.rua,
    endereco.numero,
    endereco.complemento,
    endereco.bairro,
    [endereco.cidade, endereco.estado].filter(Boolean).join(" - "),
    endereco.cep ? `CEP: ${endereco.cep}` : "",
    endereco.referencia ? `Referência: ${endereco.referencia}` : "",
  ]
    .filter(Boolean)
    .join(", ");
}
