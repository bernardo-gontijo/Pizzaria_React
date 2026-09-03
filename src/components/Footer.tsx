import { Headset } from "lucide-react";
import { useTenantConfig } from "../context/TenantConfigContext";

const SUPORTE_WHATSAPP_NUMERO = "5592994969199";
const SUPORTE_WHATSAPP_MENSAGEM = encodeURIComponent(
  "Olá! Preciso de suporte com a Pizzaria.",
);
const SUPORTE_WHATSAPP_URL = `https://wa.me/${SUPORTE_WHATSAPP_NUMERO}?text=${SUPORTE_WHATSAPP_MENSAGEM}`;

export function Footer() {
  const { config } = useTenantConfig();

  return (
    <footer className="footer" id="contato">
      <strong>{config.nome}</strong>
      <span>{config.endereco}</span>
      <span>Atendimento: {config.horarioFuncionamento}</span>
      <a className="footer__suporte" href=
      {SUPORTE_WHATSAPP_URL} target="_blank" 
      rel="noopener noreferrer"
      >
        <Headset size={18} />
        Suporte da Pizzaria
      </a>
    </footer>
  );
}