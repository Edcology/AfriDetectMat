import Link from "next/link";
import { CalendarDays } from "lucide-react";
import type { ReactNode } from "react";
import { dayTime, longDate, TODAY } from "@/lib/format";

export function MotherHeader({
  title,
  subtitle,
  actions,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="flex min-w-0 flex-col gap-2">
        <h1 className="page-title">{title}</h1>
        {subtitle ? <p className="page-subtitle">{subtitle}</p> : null}
      </div>
      <div className="flex items-center gap-3">
        {actions}
        <Link
          href="/mother/appointments"
          className="inline-flex h-[46px] items-center gap-2 rounded-pill border border-line bg-white px-4 text-[14px] leading-[18px] font-normal text-ink-soft hover:text-ink"
        >
          <CalendarDays size={16} strokeWidth={1.7} />
          {dayTime(TODAY).split(" · ")[0]}
        </Link>
      </div>
    </div>
  );
}

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={`rounded-[16px] border border-line bg-white ${className ?? ""}`}>{children}</div>;
}

export function TodayNote() {
  return <p className="text-[12px] leading-[16px] text-muted">{longDate(TODAY)}</p>;
}
