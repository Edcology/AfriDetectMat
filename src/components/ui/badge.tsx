import { AlertTriangle, CheckCircle2, CircleHelp, CircleSlash2 } from "lucide-react";
import type { ReactNode } from "react";
import type { ReviewStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

export const statusMeta: Record<
  ReviewStatus,
  { label: string; className: string; Icon: typeof AlertTriangle }
> = {
  urgent: {
    label: "Urgent review",
    className: "bg-danger-soft text-danger",
    Icon: AlertTriangle,
  },
  review: {
    label: "Review recommended",
    className: "bg-warn-soft text-warn",
    Icon: CircleHelp,
  },
  routine: {
    label: "Routine monitoring",
    className: "bg-success-soft text-success",
    Icon: CheckCircle2,
  },
  "more-data": {
    label: "More data needed",
    className: "bg-info-soft text-info",
    Icon: CircleSlash2,
  },
};

export function StatusBadge({
  status,
  className,
  label,
}: {
  status: ReviewStatus;
  className?: string;
  label?: string;
}) {
  const meta = statusMeta[status];
  const Icon = meta.Icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-pill px-3 py-2 text-[12px] leading-[15px] font-normal tracking-[-0.12px] whitespace-nowrap",
        meta.className,
        className
      )}
    >
      <Icon size={12} strokeWidth={1.75} aria-hidden />
      {label ?? meta.label}
    </span>
  );
}

type Tone = "neutral" | "brand" | "success" | "danger" | "warn" | "info";

const tones: Record<Tone, string> = {
  neutral: "bg-surface-muted text-ink-soft",
  brand: "bg-brand-tint text-brand-deep",
  success: "bg-success-soft text-success",
  danger: "bg-danger-soft text-danger",
  warn: "bg-warn-soft text-warn",
  info: "bg-info-soft text-info",
};

export function Pill({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-pill px-3 py-[7px] text-[12px] leading-[15px] font-normal tracking-[-0.12px] whitespace-nowrap",
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

export function Dot({ className }: { className?: string }) {
  return <span className={cn("size-1.5 shrink-0 rounded-full", className)} />;
}
