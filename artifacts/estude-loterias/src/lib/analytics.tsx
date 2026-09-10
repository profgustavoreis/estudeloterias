import { useEffect, useRef } from "react";
import { useLocation } from "wouter";

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
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

    let sent = false;
    let rafId: number | null = null;
    const initialTitle = document.title;

    const sendPageView = () => {
      if (sent) return;
      sent = true;
      if (typeof window.gtag !== "undefined") {
        window.gtag("config", "G-EL1Z05CW52", {
          page_path: location,
          page_location: window.location.href,
          page_title: document.title,
        });
      }
    };

    // Escuta a atualização do document.title pelo react-helmet-async
    let observer: MutationObserver | null = null;
    if (typeof MutationObserver !== "undefined" && document.head) {
      observer = new MutationObserver(() => {
        if (document.title !== initialTitle) {
          rafId = requestAnimationFrame(sendPageView);
        }
      });

      observer.observe(document.head, {
        subtree: true,
        characterData: true,
        childList: true,
      });
    }

    // Timeout de fallback para garantir o envio caso o título seja igual ou o observer não dispare
    const timeoutId = setTimeout(sendPageView, 150);

    return () => {
      sent = true;
      observer?.disconnect();
      clearTimeout(timeoutId);
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
    };
  }, [location]);

  return null;
}
