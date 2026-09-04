import { useCallback, useState } from "react";

import {
  adicionarCombo as adicionarComboService,
  buscarCombosResolvidos,
  editarCombo as editarComboService,
  excluirCombo as excluirComboService,
} from "../../loja/api/combos.service";
import type { ComboInput } from "../../loja/api/combos.service";
import type { ComboResolvido } from "../../loja/types/combos";

export function useAdminCombos() {
  const [combos, setCombos] = useState<ComboResolvido[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const carregarCombos = useCallback(async () => {
    try {
      setCarregando(true);
      setErro(null);
      setCombos(await buscarCombosResolvidos());
    } catch (error) {
      setErro(
        error instanceof Error ? error.message : "Ocorreu um erro desconhecido",
      );
    } finally {
      setCarregando(false);
    }
  }, []);

  async function adicionarCombo(dados: ComboInput) {
    await adicionarComboService(dados);
    await carregarCombos();
  }

  async function editarCombo(id: string, dados: ComboInput) {
    await editarComboService(id, dados);
    await carregarCombos();
  }

  async function excluirCombo(id: string) {
    await excluirComboService(id);
    await carregarCombos();
  }

  return {
    combos,
    carregando,
    erro,
    carregarCombos,
    adicionarCombo,
    editarCombo,
    excluirCombo,
  };
}
