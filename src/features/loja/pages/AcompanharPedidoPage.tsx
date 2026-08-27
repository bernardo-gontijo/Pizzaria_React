import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { StatusPedido } from "../components/StatusPedido";
import { buscarPedidoPorId } from "../api/pedidos.service";

export function AcompanharPedidoPage() {
    const { id } = useParams<{ id: string }>();
    const [pedido, setPedido] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [erro, setErro] = useState<string | null>(null);

    useEffect(() => {
        async function carregar() {
            try {
                setLoading(true);
                const resultado = await buscarPedidoPorId(id!);
                if (resultado) {
                    setPedido(resultado);
                } else {
                    setErro("Pedido não encontrado");
                }
            } catch (error: any) {
                setErro(error.message || "Erro ao carregar pedido");
            } finally {
                setLoading(false);
            }
        }

        if (id) carregar();
    }, [id]);

    if (loading) return <p>Carregando pedido...</p>;
    if (erro) return <p>Erro: {erro}</p>;
    if (!pedido) return <p>Pedido não encontrado</p>;

    return (
        <div className="acompanhar-page">
            <h1>Acompanhar Pedido</h1>
            <StatusPedido pedido={pedido} />
        </div>
    );
}