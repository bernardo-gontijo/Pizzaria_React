const SUPORTE_WHATSAPP_NUMERO = "5592994969199";

const SUPORTE_WHATSAPP_MENSAGEM = encodeURIComponent(
  "Olá! Preciso de suporte com a Pizzaria.",
);

export const SUPORTE_WHATSAPP_URL = `https://wa.me/${SUPORTE_WHATSAPP_NUMERO}?text=${SUPORTE_WHATSAPP_MENSAGEM}`;