import { useCallback, useState } from "react";

import {
  adicionarItemNaMesa,
  abrirMesa,
  atualizarQuantidadeItemNaMesa,
  buscarComandasDaMesa,
  buscarMesaPorId,
  criarComanda,
  encerrarContaMesa,
  pagarComanda,
  removerItemNaMesa,
  type Comanda,
} from "../api/mesa.service";

import type { Mesa } from "../types/mesa";

import type { ItemPedido, Pedido } from "../../loja/types/pedido";

export function usePedidoMesa(mesaId: string) {
  const [mesa, setMesa] = useState<Mesa | null>(null);

  const [comandas, setComandas] = useState<Comanda[]>([]);

  const [comandaSelecionadaId, setComandaSelecionadaId] = useState<
    number | null
  >(null);

  const [loading, setLoading] = useState(true);

  const [erro, setErro] = useState<string | null>(null);

  const carregar = useCallback(
    async (comandaPreferidaId?: number) => {
      try {
        setLoading(true);
        setErro(null);

        const [mesaAtual, comandasAtuais] = await Promise.all([
          buscarMesaPorId(mesaId),
          buscarComandasDaMesa(mesaId),
        ]);

        setMesa(mesaAtual);

        setComandas(comandasAtuais);

        setComandaSelecionadaId((idAtual) => {
          if (comandaPreferidaId !== undefined) {
            const preferida = comandasAtuais.find(
              (comanda) => comanda.id === comandaPreferidaId,
            );

            if (preferida) {
              return preferida.id;
            }
          }

          if (idAtual !== null) {
            const atual = comandasAtuais.find(
              (comanda) => comanda.id === idAtual,
            );

            if (atual?.status === "aberta") {
              return atual.id;
            }
          }

          const primeiraAberta = comandasAtuais.find(
            (comanda) => comanda.status === "aberta",
          );

          if (primeiraAberta) {
            return primeiraAberta.id;
          }

          if (idAtual !== null) {
            const atual = comandasAtuais.find(
              (comanda) => comanda.id === idAtual,
            );

            if (atual) {
              return atual.id;
            }
          }

          return comandasAtuais[0]?.id ?? null;
        });
      } catch (error) {
        setErro(
          error instanceof Error ? error.message : "Erro ao carregar mesa",
        );
      } finally {
        setLoading(false);
      }
    },
    [mesaId],
  );

  function selecionarComanda(comandaId: number) {
    const comanda = comandas.find((item) => item.id === comandaId);

    if (!comanda) {
      return;
    }

    setComandaSelecionadaId(comanda.id);
  }

  async function abrir() {
    try {
      setErro(null);

      await abrirMesa(mesaId);

      await carregar();
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Erro ao abrir mesa");

      throw error;
    }
  }

  async function criarNovaComanda(nome?: string) {
    try {
      setErro(null);

      const novaComanda = await criarComanda(mesaId, nome);

      await carregar(novaComanda.id);

      return novaComanda;
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Erro ao criar comanda");

      throw error;
    }
  }

  async function adicionarItem(item: Omit<ItemPedido, "id">) {
    if (comandaSelecionadaId === null) {
      throw new Error("Selecione uma comanda.");
    }

    try {
      setErro(null);

      await adicionarItemNaMesa(mesaId, item, comandaSelecionadaId);

      await carregar(comandaSelecionadaId);
    } catch (error) {
      setErro(
        error instanceof Error ? error.message : "Erro ao adicionar item",
      );

      throw error;
    }
  }

  async function atualizarQuantidadeItem(itemId: string, quantidade: number) {
    if (comandaSelecionadaId === null) {
      throw new Error("Selecione uma comanda.");
    }

    try {
      setErro(null);

      await atualizarQuantidadeItemNaMesa(
        mesaId,
        itemId,
        quantidade,
        comandaSelecionadaId,
      );

      await carregar(comandaSelecionadaId);
    } catch (error) {
      setErro(
        error instanceof Error ? error.message : "Erro ao atualizar item",
      );

      throw error;
    }
  }

  async function removerItem(itemId: string) {
    if (comandaSelecionadaId === null) {
      throw new Error("Selecione uma comanda.");
    }

    try {
      setErro(null);

      await removerItemNaMesa(mesaId, itemId, comandaSelecionadaId);

      await carregar(comandaSelecionadaId);
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Erro ao remover item");

      throw error;
    }
  }

  async function pagarComandaSelecionada() {
    if (comandaSelecionadaId === null) {
      throw new Error("Nenhuma comanda selecionada.");
    }

    try {
      setErro(null);

      const resultado = await pagarComanda(comandaSelecionadaId);

      await carregar();

      return resultado;
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Erro ao pagar comanda");

      throw error;
    }
  }

  async function encerrarConta(gorjeta?: number) {
    try {
      setErro(null);

      const registro = await encerrarContaMesa(mesaId, gorjeta);

      await carregar();

      return registro;
    } catch (error) {
      setErro(
        error instanceof Error ? error.message : "Erro ao encerrar conta",
      );

      throw error;
    }
  }

  const comandaSelecionada =
    comandas.find((comanda) => comanda.id === comandaSelecionadaId) ?? null;

  const pedido: Pedido | null = comandaSelecionada?.pedidos[0] ?? null;

  return {
    mesa,

    comandas,
    comandaSelecionada,
    comandaSelecionadaId,

    pedido,

    loading,
    erro,

    carregar,

    selecionarComanda,

    abrir,
    criarNovaComanda,

    adicionarItem,
    atualizarQuantidadeItem,
    removerItem,

    pagarComandaSelecionada,

    encerrarConta,
  };
}
