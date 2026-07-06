import * as React from "react";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Cost calculation
// ---------------------------------------------------------------------------

/**
 * Calculate the cost of a Super Sete bet based on digits per column.
 *
 * Simplified cost model:
 *   Base: 1 digit per column × 7 columns = R$ 2.50
 *   Formula: 2.50 × (product of digitosPorColunaArray)
 *
 * Examples:
 *   [1,1,1,1,1,1,1] → 2.50 × 1       = R$ 2.50
 *   [2,2,2,2,2,2,2] → 2.50 × 128     = R$ 320.00
 *   [3,3,3,3,3,3,3] → 2.50 × 2187    = R$ 5.467,50
 *   [1,2,1,1,1,1,1] → 2.50 × 2       = R$ 5.00
 *
 * NOTE: This is a simplified multiplicative model. It should be reconciled
 * with Caixa's official pricing table for Super Sete before production use.
 */
export function calcularCusto(digitosPorColunaArray: (1 | 2 | 3)[]): number {
  const product = digitosPorColunaArray.reduce((acc, n) => acc * n, 1);
  return Number((2.5 * product).toFixed(2));
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface DigitColumnsPickerProps {
  values: (string | string[])[]; // 7 items; arrays for multiple bets
  onChange: (v: (string | string[])[]) => void;
  disabledDigits?: Record<number, string[]>; // column index → digits to highlight as disabled (conferidor)
}

const NUM_COLUMNS = 7;
const DIGITS = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Compute the progressive limit based on current selections:
 * - Limit = 1 until every column has at least 1 digit
 * - Limit = 2 once every column has at least 1 digit
 * - Limit = 3 once every column has at least 2 digits
 *
 * A column with fewer digits than the limit can still receive more;
 * a column at the limit is full. The limit never drops below what
 * the minimum-filled column has.
 */
function computeProgressiveLimit(values: (string | string[])[]): 1 | 2 | 3 {
  const minDigits = Math.min(
    ...values.map((v) => normalizeValue(v).length)
  );
  if (minDigits >= 2) return 3;
  if (minDigits >= 1) return 2;
  return 1;
}

/**
 * Verify that no column deviates from any other by more than 1 digit.
 * This enforces the bet-slip rule: max - min ≤ 1.
 * Once the bet is "at level 3" (all columns have 3 digits), you can
 * drop one column to 2, but not to 1 — that creates a spread of 2.
 */
function isValidProgressiveState(values: (string | string[])[]): boolean {
  const counts = values.map((v) => normalizeValue(v).length);
  const min = Math.min(...counts);
  const max = Math.max(...counts);
  return max - min <= 1;
}

/**
 * For a column at the current minimum level, its selected digits cannot be
 * removed because doing so would create a spread > 1 (the min drops by 1
 * while another column stays at max). Returns the digits to treat as
 * immovable (selected but disabled).
 */
function computeImmovableDigits(
  values: (string | string[])[],
  colIndex: number
): string[] {
  const counts = values.map((v) => normalizeValue(v).length);
  const colCount = counts[colIndex];
  const min = Math.min(...counts);
  const max = Math.max(...counts);
  if (colCount === min && max - min >= 1) {
    return normalizeValue(values[colIndex]);
  }
  return [];
}

function normalizeValue(
  v: string | string[] | undefined
): string[] {
  if (v == null) return [];
  if (Array.isArray(v)) return v.filter(d => d !== "");
  return v === "" ? [] : [v];
}

// ---------------------------------------------------------------------------
// Single column
// ---------------------------------------------------------------------------

interface DigitColumnProps {
  colIndex: number;
  selected: string[];
  limit: 1 | 2 | 3;
  disabledDigits?: string[];
  immovableDigits?: string[];
  onToggle: (colIndex: number, digit: string) => void;
}

function DigitColumn({
  colIndex,
  selected,
  limit,
  disabledDigits,
  immovableDigits,
  onToggle,
}: DigitColumnProps) {
  const isOverLimit = selected.length > limit;
  const isDisabled = (digit: string) =>
    (!selected.includes(digit) && selected.length >= limit) ||
    (selected.includes(digit) && immovableDigits?.includes(digit) === true);

  return (
    <div
      className={cn(
        "flex flex-col items-center gap-1 rounded-lg p-1 transition-colors",
        isOverLimit && "animate-shake"
      )}
      style={
        isOverLimit
          ? { animation: "shake 0.4s ease-in-out" }
          : undefined
      }
    >
      {DIGITS.map((digit) => {
        const isSelected = selected.includes(digit);
        const isDisabledForSelection = isDisabled(digit);
        const isImmovable = isSelected && immovableDigits?.includes(digit) === true;
        const isDisabledHighlight =
          disabledDigits?.includes(digit) ?? false;

        return (
          <button
            key={digit}
            type="button"
            disabled={isDisabledForSelection}
            onClick={() => {
              if (isImmovable) return;
              onToggle(colIndex, digit);
            }}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-md text-xs font-semibold transition-all duration-150",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              isSelected && !isImmovable
                ? "bg-[#a8cf45] text-white shadow-sm"
                : isImmovable
                  ? "bg-[#a8cf45]/60 text-white/70 shadow-sm cursor-not-allowed"
                  : isDisabledForSelection
                    ? "cursor-not-allowed border border-muted text-muted-foreground/40"
                    : isDisabledHighlight
                      ? "border border-destructive/50 bg-muted/30 text-muted-foreground/50"
                      : "border border-input bg-transparent text-foreground hover:bg-muted hover-elevate"
            )}
            aria-pressed={isSelected}
            aria-label={`Coluna ${colIndex + 1}, número ${digit}${isSelected ? " selecionado" : ""}`}
          >
            {digit}
          </button>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function DigitColumnsPicker({
  values,
  onChange,
  disabledDigits,
}: DigitColumnsPickerProps) {
  const globalLimit = computeProgressiveLimit(values);

  const handleToggle = React.useCallback(
    (colIndex: number, digit: string) => {
      const current = normalizeValue(values[colIndex]);

      if (current.includes(digit)) {
        const next = current.filter((d) => d !== digit);
        const newValues = [...values];
        newValues[colIndex] = next.length <= 1 ? (next[0] ?? "") : next;

        // Block removal that would create a spread > 1 between columns
        if (!isValidProgressiveState(newValues)) return;
        onChange(newValues);
      } else {
        if (current.length >= globalLimit) return;
        const next = [...current, digit];
        const newValues = [...values];
        newValues[colIndex] = next.length === 1 ? next[0] : next;
        onChange(newValues);
      }
    },
    [values, globalLimit, onChange]
  );

  return (
    <div className="flex items-start justify-center gap-2 sm:gap-3">
      {Array.from({ length: NUM_COLUMNS }, (_, colIndex) => {
        const selected = normalizeValue(values[colIndex]);

        return (
          <div key={colIndex} className="flex flex-col items-center gap-1">
            <span className="mb-1 text-xs font-medium text-muted-foreground">
              Col. {colIndex + 1}
            </span>
            <DigitColumn
              colIndex={colIndex}
              selected={selected}
              limit={globalLimit}
              disabledDigits={disabledDigits?.[colIndex]}
              immovableDigits={computeImmovableDigits(values, colIndex)}
              onToggle={handleToggle}
            />
            <span
              className={cn(
                "mt-1 text-[10px] font-medium tabular-nums",
                selected.length > globalLimit
                  ? "text-destructive"
                  : "text-muted-foreground"
              )}
            >
              {selected.length}/{globalLimit}
            </span>
          </div>
        );
      })}
    </div>
  );
}
