import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface TabLinkItem {
  href: string;
  label: string;
  count?: number;
}

export function UnderlineTabs({
  items,
  active,
  className,
  size = "md",
}: {
  items: TabLinkItem[];
  active: string;
  className?: string;
  size?: "sm" | "md";
}) {
  return (
    <div className={cn("flex items-stretch gap-8 overflow-x-auto border-b border-line-soft no-scrollbar", className)}>
      {items.map((item) => {
        const isActive = item.label.toLowerCase() === active.toLowerCase();
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "focus-ring relative flex shrink-0 items-center gap-2 whitespace-nowrap pb-4 transition-colors",
              size === "md" ? "text-[16px] leading-[20.2px]" : "text-[14px] leading-[17.6px]",
              isActive ? "font-medium text-ink" : "font-normal text-ink-soft hover:text-ink"
            )}
          >
            {item.label}
            {typeof item.count === "number" ? (
              <span className="rounded-pill bg-surface-muted px-2 py-0.5 text-[11px] leading-[14px] font-medium text-ink-soft">
                {item.count}
              </span>
            ) : null}
            {isActive ? <span className="absolute inset-x-0 -bottom-px h-0.5 bg-ink" /> : null}
          </Link>
        );
      })}
    </div>
  );
}

export function ChipLinks({
  items,
  active,
  className,
  trailing,
}: {
  items: TabLinkItem[];
  active: string;
  className?: string;
  trailing?: ReactNode;
}) {
  return (
    <div className={cn("flex flex-wrap items-center gap-3", className)}>
      {items.map((item) => {
        const isActive = item.label.toLowerCase() === active.toLowerCase();
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "focus-ring inline-flex h-[34px] items-center rounded-pill border px-4 text-[14px] leading-[17.6px] transition-colors",
              isActive
                ? "border-brand bg-brand font-medium text-white"
                : "border-line-soft bg-white font-normal text-ink-soft hover:border-line hover:text-ink"
            )}
          >
            {item.label}
          </Link>
        );
      })}
      {trailing ? <div className="ml-auto flex items-center gap-3">{trailing}</div> : null}
    </div>
  );
}
