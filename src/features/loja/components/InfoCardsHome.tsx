import { Clock, Headset, MapPin } from "lucide-react";

import { useTenantConfig } from "../../../context/TenantConfigContext";
import { SUPORTE_WHATSAPP_URL } from "../../../utils/whatsapp";

function linkDoMapa(endereco: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    endereco,
  )}`;
}

export function InfoCardsHome() {
  const { config } = useTenantConfig();

  return (
    <section className="info-cards-home" aria-label="Informações da loja">
      <article className="info-card-home">
        <span className="info-card-home__icone" aria-hidden="true">
          <MapPin size={20} />
        </span>

        <div>
          <span className="info-card-home__rotulo">Onde estamos</span>
          <strong>{config.endereco}</strong>

          <a
            className="info-card-home__link"
            href={linkDoMapa(config.endereco)}
            target="_blank"
            rel="noopener noreferrer"
          >
            Ver no mapa →
          </a>
        </div>
      </article>

      <article className="info-card-home">
        <span className="info-card-home__icone" aria-hidden="true">
          <Clock size={20} />
        </span>

        <div>
          <span className="info-card-home__rotulo">
            Horário de atendimento
          </span>
          <strong>{config.horarioFuncionamento}</strong>

          <span className="info-card-home__status">
            <span aria-hidden="true" /> Confira nosso horário
          </span>
        </div>
      </article>

      <article className="info-card-home">
        <span className="info-card-home__icone" aria-hidden="true">
          <Headset size={20} />
        </span>

        <div>
          <span className="info-card-home__rotulo">Precisa de ajuda?</span>
          <strong>Suporte ao cliente</strong>

          <a
            className="info-card-home__whatsapp"
            href={SUPORTE_WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            Chamar no WhatsApp
          </a>
        </div>
      </article>
    </section>
  );
}