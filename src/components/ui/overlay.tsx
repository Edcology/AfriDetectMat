"use client";

import { X } from "lucide-react";
import { useEffect, type ReactNode } from "react";
import { cn } from "@/lib/utils";

function useOverlay(open: boolean, onClose: () => void) {
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open, onClose]);
}

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg";
}) {
  useOverlay(open, onClose);
  if (!open) return null;

  const width = size === "sm" ? "max-w-[400px]" : size === "lg" ? "max-w-[640px]" : "max-w-[460px]";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close dialog"
        onClick={onClose}
        className="animate-fade absolute inset-0 cursor-default bg-[#182522]/55"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          "animate-pop relative flex max-h-[calc(100dvh-2rem)] w-full flex-col overflow-hidden rounded-[16px] border border-line bg-white shadow-[0_24px_60px_-20px_rgba(24,37,34,0.35)]",
          width
        )}
      >
        <div className="flex items-start justify-between gap-6 px-6 pt-6">
          <div className="flex flex-col gap-1">
            <h2 className="text-[18px] leading-[23px] font-semibold tracking-[-0.18px] text-ink">{title}</h2>
            {description ? <p className="text-[13px] leading-[16px] text-ink-soft">{description}</p> : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="focus-ring -mt-1 grid size-8 shrink-0 place-items-center rounded-[8px] text-ink-soft hover:bg-surface-muted"
          >
            <X size={16} />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">{children}</div>
        {footer ? <div className="flex items-center justify-end gap-3 border-t border-line-soft px-6 py-4">{footer}</div> : null}
      </div>
    </div>
  );
}

export function Drawer({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  width = 460,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  width?: number;
}) {
  useOverlay(open, onClose);
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        type="button"
        aria-label="Close panel"
        onClick={onClose}
        className="animate-fade absolute inset-0 cursor-default bg-[#182522]/45"
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={title}
        style={{ width }}
        className={cn(
          "animate-pop relative flex h-full max-w-[92vw] flex-col border-l border-line bg-white shadow-[-24px_0_60px_-30px_rgba(24,37,34,0.4)]"
        )}
      >
        <div className="flex items-start justify-between gap-6 border-b border-line-soft px-6 py-5">
          <div className="flex flex-col gap-1">
            <h2 className="text-[16px] leading-[20px] font-semibold tracking-[-0.16px] text-ink">{title}</h2>
            {description ? <p className="text-[12px] leading-[15px] text-ink-soft">{description}</p> : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="focus-ring grid size-8 shrink-0 place-items-center rounded-[8px] text-ink-soft hover:bg-surface-muted"
          >
            <X size={16} />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">{children}</div>
        {footer ? <div className="border-t border-line-soft px-6 py-4">{footer}</div> : null}
      </aside>
    </div>
  );
}
