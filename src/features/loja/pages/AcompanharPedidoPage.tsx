import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { StatusPedido } from "../components/StatusPedido";
import {
  buscarPedidoPorId,
  PEDIDOS_ATUALIZADOS_EVENT,
} from "../api/pedidos.service";
import type { Pedido } from "../types/pedido";

export function AcompanharPedidoPage() {
  const { id } = useParams<{ id: string }>();
  const [pedido, setPedido] = useState<Pedido | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    async function carregar() {
      try {
        setLoading(true);
        setErro(null);
        const resultado = await buscarPedidoPorId(id!);
        if (resultado) {
          setPedido(resultado);
        } else {
          setErro("Pedido não encontrado");
        }
      } catch (error) {
        setErro(
          error instanceof Error ? error.message : "Erro ao carregar pedido",
        );
      } finally {
        setLoading(false);
      }
    }

    function atualizarPedido() {
      void carregar();
    }

    if (id) {
      void carregar();
      window.addEventListener(PEDIDOS_ATUALIZADOS_EVENT, atualizarPedido);
      window.addEventListener("storage", atualizarPedido);
    }

    return () => {
      window.removeEventListener(PEDIDOS_ATUALIZADOS_EVENT, atualizarPedido);
      window.removeEventListener("storage", atualizarPedido);
    };
  }, [id]);

  if (loading) return <p className="feedback">Carregando pedido...</p>;
  if (erro) return <p className="feedback feedback--erro">Erro: {erro}</p>;
  if (!pedido)
    return <p className="feedback feedback--erro">Pedido não encontrado</p>;

  return (
    <section className="pagina-loja acompanhar-page">
      <h1>Acompanhar pedido</h1>
      <p className="pagina-loja__introducao">
        Acompanhe em tempo real cada etapa do preparo da sua pizza.
      </p>
      <StatusPedido pedido={pedido} />
    </section>
  );
}
