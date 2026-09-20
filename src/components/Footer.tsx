import { Headset } from "lucide-react";
import { useTenantConfig } from "../context/TenantConfigContext";
import { SUPORTE_WHATSAPP_URL } from "../utils/whatsapp";

export function Footer() {
  const { config } = useTenantConfig();

  return (
    <footer className="footer" id="contato">
      <strong>{config.nome}</strong>
      <span>{config.endereco}</span>
      <span>Atendimento: {config.horarioFuncionamento}</span>
      <a
        className="footer__suporte"
        href={SUPORTE_WHATSAPP_URL}
        target="_blank"
        rel="noopener noreferrer"
      >
        <Headset size={18} />
        Suporte da Pizzaria
      </a>
    </footer>
  );
}