import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Card({ className, children, ...props }: ComponentProps<"div">) {
  return (
    <div
      {...props}
      className={cn("rounded-card border border-line bg-white", className)}
    >
      {children}
    </div>
  );
}

export function CardBody({ className, children, ...props }: ComponentProps<"div">) {
  return (
    <div {...props} className={cn("p-4 px-6", className)}>
      {children}
    </div>
  );
}

export function SectionCard({
  title,
  action,
  children,
  className,
  bodyClassName,
  id,
}: {
  title?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
  id?: string;
}) {
  return (
    <Card id={id} className={cn("flex flex-col", className)}>
      {(title || action) && (
        <div className="flex items-start justify-between gap-4 px-6 pt-4">
          {typeof title === "string" ? <h2 className="card-title">{title}</h2> : title}
          {action}
        </div>
      )}
      <div className={cn("p-4 px-6", bodyClassName)}>{children}</div>
    </Card>
  );
}

export function PageHeader({
  title,
  subtitle,
  badge,
  actions,
  children,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  badge?: ReactNode;
  actions?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 flex-col gap-2">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="page-title">{title}</h1>
            {badge}
          </div>
          {subtitle ? <p className="page-subtitle">{subtitle}</p> : null}
        </div>
        {actions ? <div className="flex items-center gap-4">{actions}</div> : null}
      </div>
      {children}
    </div>
  );
}
