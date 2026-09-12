import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Flag, Gift, PartyPopper, ArrowRight, Clock3 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LotteryBall } from "@/components/ui/lottery-ball";
import { formatCurrency } from "@/lib/formatters";
import {
  brDateToDrawTimeUTC,
  type SpecialEditionFaixaResumo,
  type SpecialEditionId,
  type SpecialEditionView,
} from "@/lib/special-editions";
import { cn } from "@/lib/utils";

const ICONS: Record<SpecialEditionId, typeof Flag> = {
  independencia: Flag,
  virada: Gift,
  "sao-joao": PartyPopper,
  pascoa: Gift,
};

const ESTADO_BADGE: Record<SpecialEditionView["estado"], { label: string; className: string }> = {
  resultado: {
    label: "Resultado oficial",
    className:
      "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800",
  },
  apuracao: {
    label: "Em apuração",
    className:
      "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800",
  },
  proxima: {
    label: "Próxima edição",
    className:
      "bg-sky-100 text-sky-800 border-sky-200 dark:bg-sky-950 dark:text-sky-300 dark:border-sky-800",
  },
};

function hexToRgba(hex: string, alpha: number): string {
  const normalized = hex.replace("#", "");
  const full =
    normalized.length === 3
      ? normalized
          .split("")
          .map((c) => c + c)
          .join("")
      : normalized;
  const r = parseInt(full.slice(0, 2), 16) || 0;
  const g = parseInt(full.slice(2, 4), 16) || 0;
  const b = parseInt(full.slice(4, 6), 16) || 0;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches === true,
  );

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReduced(query.matches);
    query.addEventListener?.("change", onChange);
    return () => query.removeEventListener?.("change", onChange);
  }, []);

  return reduced;
}

interface Contagem {
  dias: number;
  horas: number;
  minutos: number;
  segundos: number;
  expirado: boolean;
}

function useCountdown(target: Date | null, tickMs: number): Contagem | null {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!target) return;
    const id = window.setInterval(() => setNow(Date.now()), tickMs);
    return () => window.clearInterval(id);
  }, [target, tickMs]);

  if (!target) return null;
  const diff = Math.max(0, target.getTime() - now);
  const totalSegundos = Math.floor(diff / 1000);
  return {
    dias: Math.floor(totalSegundos / 86_400),
    horas: Math.floor((totalSegundos % 86_400) / 3600),
    minutos: Math.floor((totalSegundos % 3600) / 60),
    segundos: totalSegundos % 60,
    expirado: diff <= 0,
  };
}

function pad(value: number): string {
  return value.toString().padStart(2, "0");
}

function Countdown({ target, view }: { target: Date | null; view: SpecialEditionView }) {
  const reduced = usePrefersReducedMotion();
  const contagem = useCountdown(target, reduced ? 60_000 : 1_000);

  if (!target || !contagem || contagem.expirado) return null;

  const unidades = reduced
    ? [
        { label: "dias", value: contagem.dias },
        { label: "horas", value: contagem.horas },
        { label: "min", value: contagem.minutos },
      ]
    : [
        { label: "dias", value: contagem.dias },
        { label: "horas", value: contagem.horas },
        { label: "min", value: contagem.minutos },
        { label: "seg", value: contagem.segundos },
      ];

  return (
    <div
      role="timer"
      aria-live="off"
      aria-label="Tempo restante até o sorteio"
      className="flex items-stretch gap-2"
    >
      {unidades.map((u) => (
        <div
          key={u.label}
          className="flex-1 rounded-lg border bg-background/70 px-2 py-3 text-center"
        >
          <div
            className={cn("text-2xl md:text-3xl font-black tabular-nums", view.accent.text)}
          >
            {pad(u.value)}
          </div>
          <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            {u.label}
          </div>
        </div>
      ))}
    </div>
  );
}

function CtaLink({ view }: { view: SpecialEditionView }) {
  const { ctaPrincipal } = view;
  const isHash = ctaPrincipal.href.startsWith("#");

  const classes = cn(
    "inline-flex min-h-12 items-center justify-center gap-2 rounded-lg px-5 py-3",
    "text-sm font-bold shadow-sm transition-colors hover:opacity-90",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
    view.accent.ring,
    view.accent.solid,
  );

  const content = (
    <>
      {ctaPrincipal.label}
      <ArrowRight className="h-4 w-4" aria-hidden="true" />
    </>
  );

  if (isHash) {
    return (
      <a href={ctaPrincipal.href} className={classes}>
        {content}
      </a>
    );
  }

  return (
    <Link href={ctaPrincipal.href} className={classes}>
      {content}
    </Link>
  );
}

function DezenasBalls({ view }: { view: SpecialEditionView }) {
  const resultado = view.resultadoDestaque;
  if (!resultado) return null;

  const dezenas2 = resultado.dezenas2 ?? [];

  // Dupla Sena: dois sorteios por concurso. Renderiza a seção "1º/2º Sorteio"
  // só quando há um segundo sorteio; as demais modalidades seguem como antes.
  if (dezenas2.length === 0) {
    return (
      <div className="flex flex-wrap gap-2" role="group" aria-label="Dezenas sorteadas">
        {resultado.dezenas.map((dezena, i) => (
          <LotteryBall key={`${dezena}-${i}`} number={dezena} size={view.bolaTamanho} color={view.cor} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div>
        <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          1º Sorteio
        </div>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Dezenas do 1º sorteio">
          {resultado.dezenas.map((dezena, i) => (
            <LotteryBall key={`1-${dezena}-${i}`} number={dezena} size={view.bolaTamanho} color={view.cor} />
          ))}
        </div>
      </div>
      <div>
        <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          2º Sorteio
        </div>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Dezenas do 2º sorteio">
          {dezenas2.map((dezena, i) => (
            <LotteryBall key={`2-${dezena}-${i}`} number={dezena} size={view.bolaTamanho} color={view.cor} />
          ))}
        </div>
      </div>
    </div>
  );
}

function ganhadoresTexto(faixa: SpecialEditionFaixaResumo): string {
  if (faixa.ganhadores <= 0) return `Nenhum ganhador na faixa de ${faixa.rotulo}`;
  const plural = faixa.ganhadores === 1 ? "aposta ganhadora" : "apostas ganhadoras";
  return `${faixa.ganhadores} ${plural} de ${faixa.rotulo}`;
}

function Cabecalho({ view }: { view: SpecialEditionView }) {
  const Icon = ICONS[view.id];
  const badge = ESTADO_BADGE[view.estado];

  return (
    <CardHeader className="relative z-10 pb-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-semibold uppercase tracking-wider",
            view.accent.soft,
          )}
        >
          <Icon className="h-4 w-4" aria-hidden="true" />
          Informações importantes
        </span>
        <Badge className={badge.className}>{badge.label}</Badge>
      </div>
    </CardHeader>
  );
}

function ConteudoResultado({ view }: { view: SpecialEditionView }) {
  const resultado = view.resultadoDestaque;
  if (!resultado) return null;
  const { faixa } = resultado;

  return (
    <CardContent className="relative z-10 space-y-5">
      <div>
        <CardTitle className={cn("text-xl md:text-2xl font-black tracking-tight", view.accent.text)}>
          Resultado da edição {resultado.anoEdicao}
        </CardTitle>
        <CardDescription className="mt-1 text-sm font-medium text-muted-foreground">
          Concurso {resultado.concurso} · {resultado.data}
        </CardDescription>
      </div>

      <DezenasBalls view={view} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-lg border bg-background/70 p-4">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Prêmio principal
          </div>
          <div className={cn("mt-1 text-2xl md:text-3xl font-black", view.accent.text)}>
            {faixa.total > 0 ? formatCurrency(faixa.total) : "—"}
          </div>
          <div className="mt-1 text-xs text-muted-foreground">{ganhadoresTexto(faixa)}</div>
        </div>
        <div className="rounded-lg border bg-background/70 p-4">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Rateio por ganhador
          </div>
          <div className={cn("mt-1 text-2xl md:text-3xl font-black", view.accent.text)}>
            {faixa.ganhadores > 0 ? formatCurrency(faixa.valorPremio) : "—"}
          </div>
          <div className="mt-1 text-xs text-muted-foreground">Faixa de {faixa.rotulo}</div>
        </div>
      </div>

      <CtaLink view={view} />
    </CardContent>
  );
}

function ConteudoProxima({ view }: { view: SpecialEditionView }) {
  // Horário oficial configurável por edição (default 20:00; Independência 2026 = 11:00).
  const alvo = brDateToDrawTimeUTC(view.proximaData, view.proximaHorario ?? undefined);
  return (
    <CardContent className="relative z-10 space-y-5">
      <div>
        <CardTitle className={cn("text-2xl md:text-3xl font-black tracking-tight", view.accent.text)}>
          {view.proximaDataLabel ?? "Próxima edição"}
        </CardTitle>
        <CardDescription className="mt-1 text-sm font-medium text-muted-foreground">
          {view.proximaStatus === "confirmada" ? "Data confirmada pela Caixa" : "Data prevista pela Caixa"}
        </CardDescription>
      </div>

      <Countdown target={alvo} view={view} />

      <div className="rounded-lg border bg-background/70 p-4">
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Prêmio estimado
        </div>
        <div className={cn("mt-1 text-2xl md:text-3xl font-black", view.accent.text)}>
          {view.valorEstimado ? formatCurrency(view.valorEstimado) : "A definir"}
        </div>
        <div className="mt-1 text-xs text-muted-foreground">
          O prêmio desta edição especial não acumula.
        </div>
      </div>

      <CtaLink view={view} />
    </CardContent>
  );
}

function ConteudoApuracao({ view }: { view: SpecialEditionView }) {
  return (
    <CardContent className="relative z-10 space-y-5">
      <div>
        <CardTitle className={cn("text-2xl md:text-3xl font-black tracking-tight", view.accent.text)}>
          Resultado em apuração
        </CardTitle>
        <CardDescription className="mt-1 text-sm font-medium text-muted-foreground">
          {view.nome} · edição {view.anoEdicao}
        </CardDescription>
      </div>

      <div className="flex flex-wrap gap-2" aria-hidden="true">
        {Array.from({ length: view.qtdDezenas }).map((_, i) => (
          <div
            key={i}
            className="h-12 w-12 rounded-full border bg-muted animate-pulse motion-reduce:animate-none"
          />
        ))}
      </div>

      <p className="text-sm text-muted-foreground">
        O sorteio da edição {view.anoEdicao} foi realizado e o resultado está sendo conferido. Assim
        que a Caixa divulgar, esta página é atualizada automaticamente.
      </p>

      <CtaLink view={view} />
    </CardContent>
  );
}

function RodapeSecundario({ view }: { view: SpecialEditionView }) {
  const mostrarProxima = view.estado === "resultado";
  const ultimo = view.ultimoResultado;

  const eyebrow = mostrarProxima ? "Próxima edição" : "Última edição";
  let principal = "";
  if (mostrarProxima) {
    const data = view.proximaData ? view.proximaData : "data a definir";
    const valor = view.valorEstimado ? ` · estimado ${formatCurrency(view.valorEstimado)}` : "";
    principal = `${data}${valor}`;
  } else if (ultimo) {
    principal = `${ultimo.anoEdicao} · ${
      ultimo.faixa.total > 0 ? formatCurrency(ultimo.faixa.total) : "prêmio não informado"
    } · ${ganhadoresTexto(ultimo.faixa)}`;
  }

  const link = mostrarProxima
    ? { href: view.ctaProxima.href, label: "Como jogar" }
    : view.ultimoResultadoLink
      ? { href: view.ultimoResultadoLink, label: "Ver resultado" }
      : { href: view.ctaPrincipal.href, label: view.ctaPrincipal.label };

  return (
    <div className="relative z-10 flex flex-col gap-2 border-t bg-muted/40 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {eyebrow}
        </div>
        <div className="truncate text-sm font-medium text-foreground">{principal}</div>
      </div>
      <Link
        href={link.href}
        className={cn(
          "inline-flex min-h-11 shrink-0 items-center gap-1.5 text-sm font-semibold whitespace-nowrap",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 rounded-md px-1",
          view.accent.text,
          view.accent.ring,
        )}
      >
        {link.label}
        <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
      </Link>
    </div>
  );
}

export interface SpecialEditionHeroProps {
  view: SpecialEditionView;
  className?: string;
}

/**
 * Card único das edições especiais: um slot dominante que muda conforme o
 * estado (resultado / próxima edição / em apuração) e um rodapé secundário
 * compacto com a informação complementar.
 */
export function SpecialEditionHero({ view, className }: SpecialEditionHeroProps) {
  return (
    <Card
      className={cn("relative overflow-hidden border-t-4", className)}
      style={{ borderTopColor: view.cor }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full blur-3xl"
        style={{ backgroundColor: hexToRgba(view.cor, 0.18) }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{ backgroundColor: hexToRgba(view.cor, 0.05) }}
      />

      <Cabecalho view={view} />

      {view.estado === "resultado" && <ConteudoResultado view={view} />}
      {view.estado === "proxima" && <ConteudoProxima view={view} />}
      {view.estado === "apuracao" && <ConteudoApuracao view={view} />}

      <RodapeSecundario view={view} />

      {view.estado === "proxima" && view.proximaStatus === "prevista" && (
        <div className="relative z-10 flex items-center gap-1.5 border-t bg-muted/20 px-6 py-2 text-[11px] text-muted-foreground">
          <Clock3 className="h-3 w-3" aria-hidden="true" />
          Datas de edições especiais podem ser ajustadas pela Caixa.
        </div>
      )}
    </Card>
  );
}
