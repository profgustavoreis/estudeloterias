import { cn } from "@/lib/utils";

interface LotteryBallProps extends React.HTMLAttributes<HTMLDivElement> {
  number: string | number;
  size?: "sm" | "md" | "lg" | "xl";
  color?: string; // Optional hex or custom class
  textColor?: string; // Optional hex for text color (defaults to #fff when color is set)
  intensity?: number; // 0-1 for heatmap coloring
  padDigits?: number; // Number of digits to pad to (default 2, 1 for single-digit like Super Sete)
}

export function LotteryBall({ 
  number, 
  size = "md", 
  color, 
  textColor,
  className,
  intensity,
  padDigits = 2,
  ...props 
}: LotteryBallProps) {
  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base",
    xl: "w-16 h-16 text-xl",
  };

  const formattedNumber = number.toString().padStart(padDigits, "0");
  
  // Base style is typical white ball with dark text, or colored ball with white text
  const baseStyle = color 
    ? { backgroundColor: color, color: textColor ?? "#fff", borderColor: "rgba(0,0,0,0.1)" }
    : { backgroundColor: "#fff", color: "#111", borderColor: "#e5e7eb" };

  // If intensity is provided (for heatmaps), interpolate color
  let customStyle = { ...baseStyle };
  if (intensity !== undefined) {
    // Red for hot, blue for cold
    const hue = (1 - intensity) * 240; // 0 = red, 240 = blue
    customStyle = {
      backgroundColor: `hsl(${hue}, 80%, 50%)`,
      color: "#fff",
      borderColor: "transparent",
    };
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full font-bold shadow-sm border",
        sizeClasses[size],
        className
      )}
      style={customStyle}
      {...props}
    >
      {formattedNumber}
    </div>
  );
}
