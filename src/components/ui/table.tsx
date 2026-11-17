import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export function TableWrap({ className, children }: ComponentProps<"div">) {
  return <div className={cn("w-full overflow-x-auto", className)}>{children}</div>;
}

export function Table({ className, children, ...props }: ComponentProps<"table">) {
  return (
    <table {...props} className={cn("w-full border-collapse text-left", className)}>
      {children}
    </table>
  );
}

export function THead({
  children,
  variant = "plain",
  className,
}: {
  children: React.ReactNode;
  variant?: "plain" | "brand";
  className?: string;
}) {
  return (
    <thead className={className}>
      <tr
        className={cn(
          variant === "brand"
            ? "bg-brand text-white [&>th]:px-6 [&>th]:py-5 [&>th]:font-medium"
            : "text-ink [&>th]:px-6 [&>th]:pb-4 [&>th]:font-medium"
        )}
      >
        {children}
      </tr>
    </thead>
  );
}

export function TH({ className, children, ...props }: ComponentProps<"th">) {
  return (
    <th {...props} className={cn("text-[16px] leading-[20px] font-medium whitespace-nowrap", className)}>
      {children}
    </th>
  );
}

export function TBody({ children }: { children: React.ReactNode }) {
  return <tbody>{children}</tbody>;
}

export function TR({ className, children, ...props }: ComponentProps<"tr">) {
  return (
    <tr
      {...props}
      className={cn(
        "border-b border-line-soft transition-colors last:border-0 hover:bg-[#fbfcfb]",
        className
      )}
    >
      {children}
    </tr>
  );
}

export function TD({ className, children, ...props }: ComponentProps<"td">) {
  return (
    <td {...props} className={cn("px-6 py-[18px] text-[16px] leading-[20.2px] font-normal text-ink", className)}>
      {children}
    </td>
  );
}
