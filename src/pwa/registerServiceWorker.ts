import { registerSW } from "virtual:pwa-register";

/**
 * Registra o service worker do app.
 *
 * - `autoUpdate`: quando uma nova versão do app é publicada, o service
 *   worker novo assume automaticamente na próxima navegação, sem exigir
 *   ação do usuário.
 * - `onOfflineReady`: disparado quando o app já pode funcionar offline
 *   (útil para exibir um aviso discreto ao usuário, se desejado no futuro).
 */
export function registerServiceWorker() {
  if (import.meta.env.MODE === "test") {
    return;
  }

  registerSW({
    immediate: true,
    onOfflineReady() {
      console.info("Pizzaria Callidus está pronta para uso offline.");
    },
    onRegisterError(error) {
      console.error("Falha ao registrar o service worker do PWA:", error);
    },
  });
}
