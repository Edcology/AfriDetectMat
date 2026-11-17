"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  BarChart3,
  BellRing,
  CalendarDays,
  ClipboardList,
  LayoutGrid,
  ScanLine,
  Settings2,
  UserRoundCheck,
  Users,
  type LucideIcon,
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  badge?: number;
}

const groups: { label: string; items: NavItem[] }[] = [
  {
    label: "Clinical",
    items: [
      { href: "/", label: "Overview", icon: LayoutGrid },
      { href: "/patients", label: "Patients", icon: Users },
      { href: "/appointments", label: "Appointments", icon: CalendarDays },
      { href: "/mother-access", label: "Mother access", icon: UserRoundCheck },
      { href: "/monitoring", label: "Monitoring", icon: Activity },
    ],
  },
  {
    label: "Insights",
    items: [
      { href: "/alerts", label: "Alerts", icon: BellRing },
      { href: "/screening", label: "Screening & AI", icon: ScanLine },
      { href: "/referrals", label: "Referrals", icon: ClipboardList },
      { href: "/reports", label: "Reports", icon: BarChart3 },
    ],
  },
  {
    label: "Administration",
    items: [{ href: "/facility-admin", label: "Facility admin", icon: Settings2 }],
  },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Sidebar({ onNavigate, alertCount = 0 }: { onNavigate?: () => void; alertCount?: number }) {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-[266px] shrink-0 flex-col bg-sidebar px-6 py-6">
      <Link
        href="/"
        onClick={onNavigate}
        className="focus-ring flex h-[49px] items-center rounded-[8px] px-3 text-[20px] leading-[25px] font-bold text-white"
      >
        AfriDetect Mat
      </Link>

      <nav className="mt-8 flex flex-1 flex-col gap-[26px]">
        {groups.map((group) => (
          <div key={group.label} className="flex flex-col gap-5">
            <p className="px-3 text-[10px] leading-[12px] font-medium tracking-[1.6px] text-white/40 uppercase">
              {group.label}
            </p>
            <ul className="flex flex-col gap-2">
              {group.items.map((item) => {
                const active = isActive(pathname, item.href);
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onNavigate}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "focus-ring relative flex h-11 items-center gap-2 overflow-hidden rounded-[8px] pr-3 pl-6 text-[16px] leading-[20.2px] transition-colors",
                        active
                          ? "bg-sidebar-active font-medium text-white"
                          : "font-medium text-white/85 hover:bg-white/5 hover:text-white"
                      )}
                    >
                      {active ? (
                        <span className="absolute inset-y-0.5 left-0 w-2 rounded-r-[4px] bg-brand-accent" />
                      ) : null}
                      <Icon size={24} strokeWidth={1.6} className="shrink-0" aria-hidden />
                      <span className="truncate">{item.label}</span>
                      {item.badge || (item.href === "/alerts" && alertCount > 0) ? (
                        <span className="ml-auto grid h-5 min-w-5 place-items-center rounded-full bg-brand-tint px-1.5 text-[10px] leading-none font-medium text-brand-deep">
                          {item.href === "/alerts" ? alertCount : item.badge}
                        </span>
                      ) : null}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <Link
        href="/profile"
        onClick={onNavigate}
        className="focus-ring mt-auto flex items-center gap-3 rounded-[8px] bg-sidebar-active px-3 py-3 transition-colors hover:bg-[#31453c]"
      >
        <Avatar name="Adika Nwosu" size={32} tone="brand" />
        <span className="flex min-w-0 flex-col gap-1">
          <span className="truncate text-[16px] leading-[20px] font-semibold text-white">Dr. Adika Nwosu</span>
          <span className="truncate text-[12px] leading-[15px] font-normal text-white/70">Consultant</span>
        </span>
      </Link>
    </div>
  );
}
