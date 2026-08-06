import { useState, useRef } from "react";
import { Link, useLocation } from "wouter";

interface ConcursoNavigatorProps {
  concurso: number;
  isLatest: boolean;
  latestConcurso: number;
  basePath: string;
  color?: string;
  simple?: boolean;
}

export function ConcursoNavigator({ concurso, isLatest, latestConcurso, basePath, color = "#009640", simple = false }: ConcursoNavigatorProps) {
  const [, navigate] = useLocation();
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function go(n: number) {
    if (n < 1) return;
    setError(null);
    setInput("");
    navigate(`${basePath}/${n}`);
  }

  function handleSearch() {
    const raw = input.trim();
    if (!/^\d+$/.test(raw)) {
      setError("Digite um número inteiro positivo");
      return;
    }
    const n = parseInt(raw, 10);
    if (n < 1) {
      setError("O valor mínimo é 1");
      return;
    }
    if (n > latestConcurso) {
      setError(`O último concurso é o ${latestConcurso}`);
      return;
    }
    go(n);
  }

  const inputClass = `rounded-md border bg-background px-3 py-1.5 text-sm text-center shadow-sm focus:outline-none focus:ring-2 focus:ring-ring transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
    error ? "border-destructive focus:ring-destructive" : "border-input"
  }`;

  if (simple) {
    return (
      <div className="flex flex-col items-end gap-1 flex-shrink-0">
        <div className="flex items-center gap-2">
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
            className={`w-28 ${inputClass}`}
          />
          <button
            onClick={handleSearch}
            className="px-3 py-1.5 text-sm font-semibold rounded-md border transition-colors whitespace-nowrap"
            style={{ borderColor: color, color }}
          >
            Buscar
          </button>
        </div>
        {error && (
          <p className="text-xs text-destructive font-medium">{error}</p>
        )}
      </div>
    );
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
          className={`w-24 ${inputClass}`}
        />
        {concurso > 1 ? (
          <Link href={`${basePath}/${concurso - 1}`} className="text-sm font-semibold hover:underline whitespace-nowrap" style={{ color }}>
            &lt; Anterior
          </Link>
        ) : (
          <span aria-hidden="true" className="text-sm font-semibold whitespace-nowrap opacity-30 cursor-not-allowed">
            &lt; Anterior
          </span>
        )}
        {!isLatest ? (
          <Link href={`${basePath}/${concurso + 1}`} className="text-sm font-semibold hover:underline whitespace-nowrap" style={{ color }}>
            Próximo &gt;
          </Link>
        ) : (
          <span aria-hidden="true" className="text-sm font-semibold whitespace-nowrap opacity-30 cursor-not-allowed">
            Próximo &gt;
          </span>
        )}
      </div>
      {error && (
        <p className="text-xs text-destructive font-medium">{error}</p>
      )}
    </div>
  );
}
