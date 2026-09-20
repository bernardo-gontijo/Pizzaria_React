import { useCallback, useState } from "react";

import {
  adicionarBebida as adicionarBebidaService,
  buscarBebidas,
  editarBebida as editarBebidaService,
  excluirBebida as excluirBebidaService,
} from "../../loja/api/bebidas.service";
import type { Bebida } from "../../loja/types/bebidas";
import type { BebidaFormData } from "../components/BebidaForm";

export function useAdminBebidas() {
  const [bebidas, setBebidas] = useState<Bebida[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const carregarBebidas = useCallback(async () => {
    try {
      setCarregando(true);
      setErro(null);
      setBebidas(await buscarBebidas());
    } catch (error) {
      setErro(
        error instanceof Error ? error.message : "Ocorreu um erro desconhecido",
      );
    } finally {
      setCarregando(false);
    }
  }, []);

  async function adicionarBebida(dados: BebidaFormData) {
    await adicionarBebidaService(dados);
    await carregarBebidas();
  }

  async function editarBebida(id: string, dados: BebidaFormData) {
    await editarBebidaService(id, dados);
    await carregarBebidas();
  }

  async function excluirBebida(id: string) {
    await excluirBebidaService(id);
    await carregarBebidas();
  }

  return {
    bebidas,
    carregando,
    erro,
    carregarBebidas,
    adicionarBebida,
    editarBebida,
    excluirBebida,
  };
}