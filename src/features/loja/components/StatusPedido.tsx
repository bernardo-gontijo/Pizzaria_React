interface StatusPedidoProps {
    pedido: {
        id: string;
        status: string;
        cliente: { nome: string };
        endereco: { rua: string };
        total: number;
    };
}

const STATUS_MAP: Record<string, string> = {
    pendente: " Aguardando",
    confirmado: " Confirmado",
    preparando: " Preparando",
    pronto: " Pronto",
    entregue: " Entregue",
    cancelado: " Cancelado",
};

export function StatusPedido({ pedido }: StatusPedidoProps) {
    const steps = ["pendente", "confirmado", "preparando", "pronto", "entregue"];
    const currentIndex = steps.indexOf(pedido.status);

    return (
        <div className="status-pedido">
            <h3>Pedido #{pedido.id.slice(-6)}</h3>
            <p>{STATUS_MAP[pedido.status] || pedido.status}</p>

            <div className="status-timeline">
                {steps.map((step, index) => (
                    <div key={step} className={index <= currentIndex ? "completed" : ""}>
                        <span>{index + 1}</span>
                        <span>{STATUS_MAP[step]}</span>
                    </div>
                ))}
            </div>

            <div className="status-detalhes">
                <p><strong>Cliente:</strong> {pedido.cliente.nome}</p>
                <p><strong>Endereço:</strong> {pedido.endereco.rua}</p>
                <p><strong>Total:</strong> R$ {pedido.total.toFixed(2)}</p>
            </div>
        </div>
    );
}