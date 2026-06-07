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
    return (
      <div className={`flex flex-col items-center justify-center bg-muted/40 border border-dashed border-border rounded-lg ${className}`}
        style={{ minHeight: format === "horizontal" ? 90 : format === "rectangle" ? 250 : 100 }}>
        {label && <span className="text-xs text-muted-foreground">Anúncio — slot: {slot}</span>}
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
