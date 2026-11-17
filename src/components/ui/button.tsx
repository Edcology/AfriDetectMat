import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "subtle" | "danger";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-[8px] font-medium whitespace-nowrap transition-colors duration-150 focus-ring disabled:pointer-events-none disabled:opacity-50";

const variants: Record<Variant, string> = {
  primary: "bg-brand text-white hover:bg-[#093f3b] active:bg-[#083733]",
  secondary: "bg-white text-ink-soft border border-line hover:border-[#a9bcb3] hover:text-ink",
  ghost: "text-ink-soft hover:bg-surface-muted hover:text-ink",
  subtle: "bg-brand-mist text-brand-deep hover:bg-[#dcede3]",
  danger: "bg-danger text-white hover:bg-[#b03d3d]",
};

const sizes: Record<Size, string> = {
  sm: "h-[33px] px-4 text-[12px] leading-[15px]",
  md: "h-[42px] px-6 text-[16px] leading-[20px]",
  lg: "h-[48px] px-7 text-[16px] leading-[20px]",
};

export function buttonClass({
  variant = "primary",
  size = "md",
  className,
}: { variant?: Variant; size?: Size; className?: string } = {}) {
  return cn(base, variants[variant], sizes[size], className);
}

type ButtonProps = ComponentProps<"button"> & { variant?: Variant; size?: Size };

export function Button({ variant, size, className, ...props }: ButtonProps) {
  return <button {...props} className={buttonClass({ variant, size, className })} />;
}

type ButtonLinkProps = ComponentProps<typeof Link> & {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
};

export function ButtonLink({ variant, size, className, children, ...props }: ButtonLinkProps) {
  return (
    <Link {...props} className={buttonClass({ variant, size, className })}>
      {children}
    </Link>
  );
}

type IconButtonProps = ComponentProps<"button"> & { label: string };

export function IconButton({ label, className, children, ...props }: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      {...props}
      className={cn(
        "focus-ring relative grid h-10 w-10 place-items-center rounded-[12px] border border-line-soft bg-white text-ink-soft transition-colors hover:border-line hover:text-ink",
        className
      )}
    >
      {children}
    </button>
  );
}

export function IconLink({ label, className, children, ...props }: ComponentProps<typeof Link> & { label: string; children: ReactNode }) {
  return (
    <Link
      aria-label={label}
      title={label}
      {...props}
      className={cn(
        "focus-ring relative grid h-10 w-10 place-items-center rounded-[12px] border border-line-soft bg-white text-ink-soft transition-colors hover:border-line hover:text-ink",
        className
      )}
    >
      {children}
    </Link>
  );
}
