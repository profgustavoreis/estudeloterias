import { useEffect, useRef } from "react";

interface AdUnitProps {
  slot: string;
  format?: "auto" | "rectangle" | "horizontal" | "vertical";
  className?: string;
  label?: boolean;
}

const PUBLISHER_ID = import.meta.env.VITE_ADSENSE_PUBLISHER_ID ?? "";
const IS_DEV = import.meta.env.DEV;

export function AdUnit({ slot, format = "auto", className = "", label = true }: AdUnitProps) {
  const ref = useRef<HTMLDivElement>(null);
  const pushed = useRef(false);

  useEffect(() => {
    if (IS_DEV || !PUBLISHER_ID || pushed.current) return;
    try {
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushed.current = true;
    } catch (e) {
      // AdSense not loaded yet
    }
  }, []);

  if (IS_DEV || !PUBLISHER_ID) {
    const height = format === "horizontal" ? 90 : format === "rectangle" ? 250 : 100;
    return (
      <div
        className={`flex flex-col items-center justify-center bg-muted/30 border border-dashed border-muted-foreground/30 rounded-lg gap-1 ${className}`}
        style={{ minHeight: height }}
      >
        <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50">Publicidade</span>
        {label && (
          <span className="text-[10px] text-muted-foreground/40">
            {format === "horizontal" ? "728×90" : format === "rectangle" ? "300×250" : "Responsivo"} · slot {slot}
          </span>
        )}
      </div>
    );
  }

  return (
    <div ref={ref} className={className}>
      {label && (
        <div className="text-center text-xs text-muted-foreground mb-1">Publicidade</div>
      )}
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={PUBLISHER_ID}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
}
