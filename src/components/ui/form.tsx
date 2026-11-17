import type { ComponentProps, ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const control =
  "w-full rounded-[8px] border border-line bg-white text-[14px] leading-[17.6px] text-ink placeholder:text-muted transition-colors focus:border-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent/15 disabled:bg-surface-muted";

export function Input({ className, ...props }: ComponentProps<"input">) {
  return <input {...props} className={cn(control, "h-[42px] px-4", className)} />;
}

export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return <textarea {...props} className={cn(control, "min-h-24 px-4 py-3", className)} />;
}

export function Select({ className, children, ...props }: ComponentProps<"select">) {
  return (
    <div className="relative">
      <select {...props} className={cn(control, "h-[42px] appearance-none pr-9 pl-4", className)}>
        {children}
      </select>
      <ChevronDown
        size={14}
        className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-ink-soft"
        aria-hidden
      />
    </div>
  );
}

export function Field({
  label,
  hint,
  error,
  htmlFor,
  children,
  className,
}: {
  label: string;
  hint?: string;
  error?: string;
  htmlFor?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <label htmlFor={htmlFor} className="text-[12px] leading-[15px] font-medium tracking-[-0.12px] text-ink-soft">
        {label}
      </label>
      {children}
      {error ? (
        <p className="text-[12px] leading-[15px] text-danger">{error}</p>
      ) : hint ? (
        <p className="text-[11px] leading-[14px] text-muted">{hint}</p>
      ) : null}
    </div>
  );
}

export function Checkbox({ className, ...props }: ComponentProps<"input">) {
  return (
    <input
      type="checkbox"
      {...props}
      className={cn("size-4 rounded-[4px] border border-line text-brand accent-[#0B4F4A]", className)}
    />
  );
}
