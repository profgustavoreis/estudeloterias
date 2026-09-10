import { cn } from "@/lib/utils";
import { LotteryBall } from "@/components/ui/lottery-ball";

interface DezenasGridProps {
  dezenas: Array<string | number>;
  /** Quantidade de dezenas por linha. Padrão 8 (Lotofácil: 8 + 7). */
  perRow?: number;
  size?: "sm" | "md" | "lg" | "xl";
  color?: string;
  className?: string;
  rowClassName?: string;
}

/**
 * Renderiza as dezenas em linhas de tamanho fixo, centralizadas.
 *
 * Em listagens/históricos a quebra previsível (ex.: 8 na primeira linha e
 * 7 na segunda, na Lotofácil) mantém as linhas alinhadas e a coluna de
 * dezenas compacta. Para outros usos, ajuste `perRow`.
 */
export function DezenasGrid({
  dezenas,
  perRow = 8,
  size = "sm",
  color,
  className,
  rowClassName,
}: DezenasGridProps) {
  if (dezenas.length === 0) return null;

  const linhas: Array<Array<string | number>> = [];
  for (let i = 0; i < dezenas.length; i += perRow) {
    linhas.push(dezenas.slice(i, i + perRow));
  }

  return (
    <div className={cn("flex flex-col items-center gap-1", className)}>
      {linhas.map((linha, rowIndex) => (
        <div key={rowIndex} className={cn("flex justify-center gap-1", rowClassName)}>
          {linha.map((numero, i) => (
            <LotteryBall key={i} number={numero} size={size} color={color} />
          ))}
        </div>
      ))}
    </div>
  );
}
