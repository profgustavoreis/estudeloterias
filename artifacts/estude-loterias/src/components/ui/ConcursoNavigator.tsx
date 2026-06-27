import { useState, useRef } from "react";
import { useLocation } from "wouter";

const BRAND = "#009640";

interface ConcursoNavigatorProps {
  concurso: number;
  isLatest: boolean;
  latestConcurso: number;
}

export function ConcursoNavigator({ concurso, isLatest, latestConcurso }: ConcursoNavigatorProps) {
  const [, navigate] = useLocation();
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function go(n: number) {
    if (n < 1) return;
    setError(null);
    setInput("");
    navigate(`/mega-sena/resultado/${n}`);
  }

  function handleSearch() {
    const n = parseInt(input.trim(), 10);
    if (isNaN(n) || n < 1) {
      setError("Número inválido");
      return;
    }
    if (n > latestConcurso) {
      setError(`Último concurso é o ${latestConcurso}`);
      return;
    }
    go(n);
  }

  return (
    <div className="flex flex-col items-end gap-1 flex-shrink-0">
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground hidden sm:inline whitespace-nowrap">
          Buscar por concurso
        </span>
        <input
          ref={inputRef}
          type="number"
          min={1}
          max={latestConcurso}
          value={input}
          onChange={(e) => { setInput(e.target.value); setError(null); }}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          placeholder="Ex: 1475"
          className={`w-24 rounded-md border bg-background px-3 py-1.5 text-sm text-center shadow-sm focus:outline-none focus:ring-2 focus:ring-ring transition-colors ${
            error ? "border-destructive focus:ring-destructive" : "border-input"
          }`}
        />
        <button
          onClick={() => go(concurso - 1)}
          disabled={concurso <= 1}
          className="text-sm font-semibold disabled:opacity-30 disabled:cursor-not-allowed hover:underline whitespace-nowrap"
          style={{ color: BRAND }}
        >
          &lt; Anterior
        </button>
        <button
          onClick={() => go(concurso + 1)}
          disabled={isLatest}
          className="text-sm font-semibold disabled:opacity-30 disabled:cursor-not-allowed hover:underline whitespace-nowrap"
          style={{ color: BRAND }}
        >
          Próximo &gt;
        </button>
      </div>
      {error && (
        <p className="text-xs text-destructive font-medium">{error}</p>
      )}
    </div>
  );
}
