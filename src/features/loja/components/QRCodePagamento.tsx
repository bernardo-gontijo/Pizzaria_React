import { QRCodeSVG } from "qrcode.react";
import { useState } from "react";
import "./QRCodePagamento.css";

interface QRCodePagamentoProps {
  valor: number;
  pedidoId: string;
  chavePix?: string;
  nomeRecebedor?: string;
}

export function QRCodePagamento({
  valor,
  pedidoId,
  chavePix = "pizzaria@email.com",
  nomeRecebedor = "Pizzaria React",
}: QRCodePagamentoProps) {
  const [copiado, setCopiado] = useState(false);

  // Gerar string PIX Copia-e-Cola
  function gerarPixCopiaCola(): string {
    const cidade = "Sao Paulo";

    const payload = [
      "000201",
      "26",
      `0014BR.GOV.BCB.PIX`,
      `0111${chavePix}`,
      "52040000",
      "5303986",
      `5405${valor.toFixed(2)}`,
      "5802BR",
      `5913${nomeRecebedor}`,
      `6009${cidade}`,
      `6207${pedidoId.slice(0, 6)}`,
      "6304",
    ].join("");

    return payload;
  }

  const pixString = gerarPixCopiaCola();

  function handleCopiar() {
    navigator.clipboard.writeText(pixString);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 3000);
  }

  return (
    <div className="qr-code-wrapper" style={{ width: "100%" }}>
      <div className="qr-code-container" style={{ width: "100%" }}>
        <QRCodeSVG
          value={pixString}
          size={200}
          bgColor="#ffffff"
          fgColor="#000000"
          level="L"
        />
      </div>

      <div className="qr-code-info">
        <p className="qr-code-titulo">Pague com PIX</p>
        <p className="qr-code-valor">R$ {valor.toFixed(2)}</p>
        <p className="qr-code-descricao">
          Escaneie o QR Code com seu banco ou use o código copia-e-cola
        </p>

        <button type="button" className="qr-code-copiar" onClick={handleCopiar}>
          {copiado ? "✅ Código copiado!" : "📋 Copiar código PIX"}
        </button>

        <div className="qr-code-chave">
          <span>Chave PIX: </span>
          <strong>{chavePix}</strong>
        </div>
      </div>
    </div>
  );
}
