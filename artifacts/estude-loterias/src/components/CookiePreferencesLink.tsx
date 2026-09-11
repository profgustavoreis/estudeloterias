import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { openCookiePreferences } from "@/lib/consent";

/**
 * Link "Preferências de cookies" para o rodapé.
 *
 * O `AppLayout.tsx` é editado em paralelo por outra lane, então este componente
 * injeta o link via portal no grupo de links existente do rodapé
 * (ao lado de "Privacidade · Termos · Contato"), sem precisar alterá-lo.
 * Se o rodapé não estiver disponível, não renderiza nada.
 */
export function CookiePreferencesLink() {
  const [target, setTarget] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (typeof document === "undefined") return;

    const footer = document.querySelector("footer");
    if (!footer) return;

    const anchor = footer.querySelector('a[href="/privacidade"]');
    const group = anchor?.parentElement;
    if (!group) return;

    const holder = document.createElement("span");
    // `display: contents` faz o separador e o botão virarem itens do flex do rodapé.
    holder.className = "contents";
    group.appendChild(holder);
    setTarget(holder);

    return () => {
      holder.remove();
      setTarget(null);
    };
  }, []);

  if (!target) return null;

  return createPortal(
    <>
      <span aria-hidden="true">·</span>
      <button
        type="button"
        onClick={openCookiePreferences}
        className="rounded transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        Preferências de cookies
      </button>
    </>,
    target,
  );
}
