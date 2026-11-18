"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import {
  BookOpen,
  CalendarDays,
  HeartHandshake,
  Home,
  Menu,
  MessageSquare,
  ScrollText,
  User,
  Volume2,
  X,
  AlertTriangle,
  Bell,
  ArrowUpRight,
  Type,
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/mother", label: "Home", icon: Home },
  { href: "/mother/check-in", label: "Daily check-in", icon: HeartHandshake },
  { href: "/mother/appointments", label: "Appointments", icon: CalendarDays },
  { href: "/mother/messages", label: "Messages", icon: MessageSquare, badgeKey: "messages" },
  { href: "/mother/records", label: "Health records", icon: ScrollText },
  { href: "/mother/learn", label: "Learn", icon: BookOpen },
  { href: "/mother/profile", label: "My profile", icon: User },
] as const;

function isActive(pathname: string, href: string) {
  if (href === "/mother") return pathname === "/mother";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function MotherSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-[266px] shrink-0 flex-col bg-sidebar px-6 py-6">
      <Link
        href="/mother"
        className="focus-ring flex h-[49px] items-center rounded-[8px] px-3 text-[20px] leading-[25px] font-bold text-white"
      >
        AfriDetect Mat
      </Link>

      <p className="mt-8 px-6 text-[10px] leading-[12px] font-medium tracking-[1.6px] text-white/40 uppercase">
        My space
      </p>

      <nav className="mt-5 flex flex-col gap-5">
        {nav.map((item) => {
          const active = isActive(pathname, item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                "focus-ring relative flex h-11 items-center gap-2 overflow-hidden rounded-[8px] pr-3 pl-6 text-[16px] leading-[20.2px] transition-colors",
                active ? "bg-sidebar-active font-medium text-white" : "font-medium text-white/85 hover:bg-white/5 hover:text-white"
              )}
            >
              {active ? <span className="absolute inset-y-0.5 left-0 w-2 rounded-r-[4px] bg-brand-accent" /> : null}
              <Icon size={24} strokeWidth={1.6} aria-hidden />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto rounded-[16px] border border-line bg-[#edf5f1] px-4 py-3">
        <span className="grid size-7 place-items-center rounded-[8px] bg-[#d9ece3] text-brand-deep">
          <HeartHandshake size={16} strokeWidth={1.7} />
        </span>
        <p className="mt-3 text-[14px] leading-[18px] font-semibold text-ink">Need help?</p>
        <p className="mt-1.5 text-[11px] leading-[15px] text-ink-soft">
          Contact your care team if you have a question about your care.
        </p>
        <Link
          href="/mother/messages"
          className="mt-3 inline-flex items-center gap-1 text-[11px] font-semibold text-brand-deep hover:underline"
        >
          View my care details <ArrowUpRight size={12} />
        </Link>
      </div>
    </div>
  );
}

function MotherTopbar({
  profileName,
  unread,
  onOpenMenu,
  textScale,
  onCycleTextSize,
  speaking,
  onToggleRead,
}: {
  profileName: string;
  unread: number;
  onOpenMenu: () => void;
  textScale: number;
  onCycleTextSize: () => void;
  speaking: boolean;
  onToggleRead: () => void;
}) {
  return (
    <header className="flex h-[86px] items-center justify-end gap-5 border-b border-line bg-white px-4 sm:px-6 lg:px-8">
      <button
        type="button"
        onClick={onOpenMenu}
        aria-label="Open navigation"
        className="focus-ring mr-auto grid size-10 place-items-center rounded-[12px] border border-line lg:hidden"
      >
        <Menu size={18} />
      </button>

      <Link
        href="/mother/messages"
        className="focus-ring inline-flex h-[38px] items-center gap-2 rounded-pill border border-[#f0bfc1] bg-[#fff8f4] px-4 text-[14px] leading-[17.6px] font-normal text-danger"
      >
        <AlertTriangle size={16} strokeWidth={1.8} />
        Urgent help?
      </Link>

      <button
        type="button"
        onClick={onCycleTextSize}
        aria-label={`Text size ${Math.round(textScale * 100)} percent`}
        title="Change text size"
        className="focus-ring hidden size-9 place-items-center rounded-[12px] border border-line text-ink-soft hover:text-ink sm:grid"
      >
        <Type size={16} />
      </button>
      <button
        type="button"
        onClick={onToggleRead}
        aria-pressed={speaking}
        aria-label={speaking ? "Stop reading aloud" : "Read this page aloud"}
        title={speaking ? "Stop reading" : "Read aloud"}
        className={`focus-ring hidden size-9 place-items-center rounded-[12px] border text-ink-soft hover:text-ink sm:grid ${
          speaking ? "border-brand-accent bg-brand-mist text-brand-deep" : "border-line"
        }`}
      >
        <Volume2 size={16} />
      </button>
      <Link
        href="/mother/notifications"
        aria-label="Notifications"
        className="focus-ring relative grid size-9 place-items-center rounded-[12px] border border-line-soft text-ink-soft"
      >
        <Bell size={16} strokeWidth={1.7} />
        {unread > 0 ? (
          <span className="absolute -top-1 -right-1 grid size-3.5 place-items-center rounded-full bg-[#fce8e5] text-[9px] font-semibold text-danger">
            {unread}
          </span>
        ) : null}
      </Link>

      <Link
        href="/mother/profile"
        className="focus-ring inline-flex h-[38px] items-center gap-2 rounded-pill border border-line pr-3 pl-1 text-ink"
      >
        <Avatar name={profileName} size={28} />
        <span className="max-w-[110px] truncate text-[14px] leading-[18px] font-normal">My profile</span>
        <span className="text-ink-soft">⌄</span>
      </Link>
    </header>
  );
}

export function MotherShell({
  children,
  profileName,
  unread,
}: {
  children: ReactNode;
  profileName: string;
  unread: number;
}) {
  const [open, setOpen] = useState(false);
  const [textScale, setTextScale] = useState(1);
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    const saved = Number(localStorage.getItem("ad:text-scale") ?? "1");
    if (Number.isFinite(saved) && saved >= 1 && saved <= 1.5) setTextScale(saved);
  }, []);

  const cycleTextSize = () => {
    const next = textScale >= 1.25 ? 1 : Math.round((textScale + 0.125) * 1000) / 1000;
    setTextScale(next);
    localStorage.setItem("ad:text-scale", String(next));
  };

  const toggleRead = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const synth = window.speechSynthesis;

    if (speaking) {
      synth.cancel();
      setSpeaking(false);
      return;
    }

    const text = document.querySelector("main")?.innerText?.trim();
    if (!text) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    synth.speak(utterance);
    setSpeaking(true);
  };

  return (
    <div className="flex min-h-dvh bg-canvas">
      <div className="sticky top-0 hidden h-dvh shrink-0 lg:block">
        <MotherSidebar />
      </div>

      {open ? (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <button
            type="button"
            aria-label="Close navigation"
            onClick={() => setOpen(false)}
            className="animate-fade absolute inset-0 bg-[#182522]/60"
          />
          <div className="animate-pop relative h-full">
            <MotherSidebar onNavigate={() => setOpen(false)} />
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close navigation"
              className="absolute top-7 right-4 grid size-8 place-items-center rounded-[8px] bg-white/10 text-white"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      ) : null}

      <div className="flex min-h-dvh min-w-0 flex-1 flex-col">
        <MotherTopbar
          profileName={profileName}
          unread={unread}
          onOpenMenu={() => setOpen(true)}
          textScale={textScale}
          onCycleTextSize={cycleTextSize}
          speaking={speaking}
          onToggleRead={toggleRead}
        />
        <main className="min-w-0 flex-1 px-4 pt-8 pb-16 sm:px-6 lg:px-8" style={{ zoom: textScale }}>
          {children}
        </main>
      </div>
    </div>
  );
}
