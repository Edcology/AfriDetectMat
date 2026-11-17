import { cn } from "@/lib/utils";

export function Avatar({
  name,
  size = 32,
  tone = "brand",
  className,
}: {
  name: string;
  size?: number;
  tone?: "brand" | "soft" | "dark";
  className?: string;
}) {
  const initials = name
    .replace(/^(Dr\.|Nurse|Mr\.|Mrs\.|Ms\.)\s*/i, "")
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <span
      className={cn(
        "inline-grid shrink-0 place-items-center rounded-full font-semibold",
        tone === "brand" && "bg-brand-accent text-white",
        tone === "soft" && "bg-brand-tint text-brand-deep",
        tone === "dark" && "bg-brand text-white",
        className
      )}
      style={{
        width: size,
        height: size,
        fontSize: Math.max(9, Math.round(size * 0.375)),
      }}
      aria-hidden
    >
      {initials}
    </span>
  );
}
