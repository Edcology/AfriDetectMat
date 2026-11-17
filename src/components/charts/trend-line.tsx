import { cn } from "@/lib/utils";

export interface TrendPoint {
  label: string;
  value: number;
}

/**
 * Straight-segment trend line with labelled nodes — the pattern used on the
 * dashboard and patient record. Drawn as SVG so it stays crisp at any width.
 */
export function TrendLine({
  points,
  tone = "#1F8A7A",
  height = 150,
  className,
  showValues = true,
}: {
  points: TrendPoint[];
  tone?: string;
  height?: number;
  className?: string;
  showValues?: boolean;
}) {
  if (points.length === 0) return null;

  const W = 560;
  const H = height;
  const padX = 26;
  const padTop = showValues ? 34 : 16;
  const padBottom = 18;

  const values = points.map((p) => p.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;

  const x = (index: number) => (points.length === 1 ? W / 2 : padX + (index * (W - padX * 2)) / (points.length - 1));
  const y = (value: number) => H - padBottom - ((value - min) / span) * (H - padTop - padBottom);

  const path = points.map((p, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(p.value).toFixed(1)}`).join(" ");

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className={cn("h-auto w-full", className)}
      role="img"
      aria-label={`Trend: ${points.map((p) => `${p.label} ${p.value}`).join(", ")}`}
    >
      <path d={path} fill="none" stroke={tone} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
      {points.map((point, index) => {
        const isLast = index === points.length - 1;
        return (
          <g key={`${point.label}-${index}`}>
            {showValues ? (
              <text
                x={x(index)}
                y={y(point.value) - 14}
                textAnchor="middle"
                fill="#8A9691"
                fontSize={11}
                fontFamily="inherit"
                fontWeight={400}
              >
                {point.value}
              </text>
            ) : null}
            <circle
              cx={x(index)}
              cy={y(point.value)}
              r={isLast ? 7 : 6}
              fill={isLast ? tone : "#FFFFFF"}
              stroke={tone}
              strokeWidth={2}
            />
          </g>
        );
      })}
    </svg>
  );
}
