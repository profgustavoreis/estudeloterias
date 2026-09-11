import { useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { CONSENT_CHANGE_EVENT, hasConsent } from "@/lib/consent";

// Reexporta o helper para os consumidores do analytics (ex.: `hasConsent('analytics')`).
export { hasConsent };

const GA_MEASUREMENT_ID = "G-EL1Z05CW52";

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}

/**
 * Envia o page_view SPA para o GA4. Não faz nada sem consentimento de analytics.
 * O GA4 é carregado em `index.html` com Consent Mode (default negado); aqui só
 * disparamos o evento quando o usuário autorizou a medição.
 */
function sendPageView(path: string): void {
  if (!hasConsent("analytics")) return;
  if (typeof window.gtag !== "undefined") {
    window.gtag("config", GA_MEASUREMENT_ID, {
      page_path: path,
      page_location: window.location.href,
      page_title: document.title,
    });
  }
}

export function AnalyticsTracker() {
  const [location] = useLocation();
  const isFirstRender = useRef(true);

  useEffect(() => {
    // Evita disparar page_view duplicado no primeiro render (já executado pelo script em index.html com o title do servidor)
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    // Nada é enviado sem consentimento explícito de análise.
    if (!hasConsent("analytics")) return;

    let sent = false;
    let rafId: number | null = null;
    const initialTitle = document.title;

    const fire = () => {
      if (sent) return;
      sent = true;
      sendPageView(location);
    };

    // Escuta a atualização do document.title pelo react-helmet-async
    let observer: MutationObserver | null = null;
    if (typeof MutationObserver !== "undefined" && document.head) {
      observer = new MutationObserver(() => {
        if (document.title !== initialTitle) {
          rafId = requestAnimationFrame(fire);
        }
      });

      observer.observe(document.head, {
        subtree: true,
        characterData: true,
        childList: true,
      });
    }

    // Timeout de fallback para garantir o envio caso o título seja igual ou o observer não dispare
    const timeoutId = setTimeout(fire, 150);

    return () => {
      sent = true;
      observer?.disconnect();
      clearTimeout(timeoutId);
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
    };
  }, [location]);

  // Se o consentimento de analytics for concedido depois do carregamento,
  // envia o page_view da rota atual (o primeiro foi negado/sem cookies).
  useEffect(() => {
    const onConsentChange = () => {
      if (hasConsent("analytics")) {
        sendPageView(window.location.pathname);
      }
    };
    window.addEventListener(CONSENT_CHANGE_EVENT, onConsentChange);
    return () => window.removeEventListener(CONSENT_CHANGE_EVENT, onConsentChange);
  }, []);

  return null;
}
