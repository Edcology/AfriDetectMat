import { cn } from "@/lib/utils";

/** The little bar cluster that sits beside each dashboard statistic. */
export function MiniBars({
  values,
  accent = "#1F8A7A",
  className,
}: {
  values: number[];
  accent?: string;
  className?: string;
}) {
  const max = Math.max(...values, 1);
  return (
    <div className={cn("flex h-[46px] items-end gap-2", className)} aria-hidden>
      {values.map((value, index) => {
        const isLast = index === values.length - 1;
        return (
          <span
            key={index}
            className="w-2.5 rounded-[4px]"
            style={{
              height: `${Math.max(24, Math.round((value / max) * 100))}%`,
              background: isLast ? accent : "#DCEDE3",
            }}
          />
        );
      })}
    </div>
  );
}
