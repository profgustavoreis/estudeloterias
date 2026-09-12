import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { openCookiePreferences } from "@/lib/consent";

/**
 * Link "Cookies" para o rodapé.
 *
 * O `AppLayout.tsx` é editado em paralelo por outra lane, então este componente
 * injeta o link via portal na lista institucional do rodapé, sem precisar
 * alterá-lo. O botão recebe exatamente as classes dos demais links
 * institucionais (`text-xs text-muted-foreground hover:text-foreground`) e vira
 * um novo `<li>`, herdando o `space-y-2` da lista.
 *
 * Reabre o banner de consentimento (decisão binária) para o usuário revisar ou
 * revogar a escolha a qualquer momento.
 *
 * Se o rodapé não estiver disponível, não renderiza nada.
 */
export function CookiePreferencesLink() {
  const [target, setTarget] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (typeof document === "undefined") return;

    const footer = document.querySelector("footer");
    if (!footer) return;

    // A lista institucional é o único <ul> do rodapé com um link de privacidade.
    // O `href$=` aceita tanto `/privacidade` quanto um path com base.
    const anchor = Array.from(
      footer.querySelectorAll<HTMLAnchorElement>('a[href$="/privacidade"]'),
    ).find((a) => a.closest("ul"));
    const list = anchor?.closest("ul");
    if (!list) return;

    const holder = document.createElement("li");
    list.appendChild(holder);
    setTarget(holder);

    return () => {
      holder.remove();
      setTarget(null);
    };
  }, []);

  if (!target) return null;

  return createPortal(
    <button
      type="button"
      onClick={openCookiePreferences}
      className="cursor-pointer text-xs text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded"
    >
      Preferências de cookies
    </button>,
    target,
  );
}
