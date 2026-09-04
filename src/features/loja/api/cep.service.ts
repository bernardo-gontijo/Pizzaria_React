import type { EnderecoEntrega } from "../types/pedido";

type EnderecoCEP = Pick<
  EnderecoEntrega,
  "rua" | "bairro" | "cidade" | "estado"
>;

export async function buscarEnderecoPorCEP(
  cep: string,
  signal?: AbortSignal,
): Promise<EnderecoCEP> {
  const numeros = cep.replace(/\D/g, "");
  if (!/^\d{8}$/.test(numeros)) {
    throw new Error("Informe um CEP com 8 dígitos.");
  }

  const resposta = await fetch(`https://viacep.com.br/ws/${numeros}/json/`, {
    signal,
  });
  if (!resposta.ok) throw new Error("Não foi possível consultar o CEP.");

  const dados = await resposta.json();
  if (dados.erro) throw new Error("CEP não encontrado.");

  return {
    rua: dados.logradouro ?? "",
    bairro: dados.bairro ?? "",
    cidade: dados.localidade ?? "",
    estado: dados.uf ?? "",
  };
}
