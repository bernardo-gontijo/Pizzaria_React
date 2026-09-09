import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { buscarPedidoClientePorId } from "../api/pedidosCliente.service";
import { StatusPedido } from "../components/StatusPedido";
import type { Pedido } from "../types/pedido";

export function AcompanharPedidoPage() {
  const { id } = useParams<{ id: string }>();

  const [pedido, setPedido] = useState<Pedido | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    async function carregarPedido() {
      if (!id) {
        setErro("Pedido não encontrado");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setErro(null);

        const resultado = await buscarPedidoClientePorId(id);

        if (!resultado) {
          setErro("Pedido não encontrado");
          return;
        }

        setPedido(resultado);
      } catch (error) {
        setErro(
          error instanceof Error
            ? error.message
            : "Erro ao carregar pedido",
        );
      } finally {
        setLoading(false);
      }
    }

    void carregarPedido();
  }, [id]);

  if (loading) {
    return <p className="feedback">Carregando pedido...</p>;
  }

  if (erro) {
    return <p className="feedback feedback--erro">Erro: {erro}</p>;
  }

  if (!pedido) {
    return (
      <p className="feedback feedback--erro">
        Pedido não encontrado
      </p>
    );
  }

  return (
    <section className="pagina-loja acompanhar-page">
      <h1>Acompanhar pedido</h1>

      <p className="pagina-loja__introducao">
        Acompanhe cada etapa do preparo do seu pedido.
      </p>

      <StatusPedido pedido={pedido} />
    </section>
  );
}