"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Bell, Building2, HelpCircle, Megaphone, Menu, MessageSquare, Search } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { IconLink } from "@/components/ui/button";
import { statusMeta } from "@/components/ui/badge";
import type { ReviewStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

export interface SearchEntry {
  name: string;
  id: string;
  slug: string;
  status: ReviewStatus;
}

export function Topbar({
  searchIndex,
  unreadCount,
  onOpenMenu,
}: {
  searchIndex: SearchEntry[];
  unreadCount: number;
  onOpenMenu: () => void;
}) {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const router = useRouter();

  const results =
    query.trim().length > 0
      ? searchIndex
          .filter(
            (entry) =>
              entry.name.toLowerCase().includes(query.trim().toLowerCase()) ||
              entry.id.toLowerCase().includes(query.trim().toLowerCase())
          )
          .slice(0, 5)
      : [];

  return (
    <div className="flex items-center gap-4 pt-6 pb-6 xl:gap-6">
      <button
        type="button"
        onClick={onOpenMenu}
        aria-label="Open navigation"
        className="focus-ring grid size-12 shrink-0 place-items-center rounded-[10px] border border-line bg-white text-ink lg:hidden"
      >
        <Menu size={20} />
      </button>

      <div className="hidden h-12 shrink-0 items-center gap-2.5 rounded-r-[8px] bg-sidebar pr-4 pl-5 text-white lg:flex">
        <Building2 size={24} strokeWidth={1.6} aria-hidden />
        <span className="text-[16px] leading-[20.2px] font-medium whitespace-nowrap">Harbour Health Centre</span>
      </div>

      <div className="relative min-w-0 flex-1 xl:max-w-[581px]">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            if (query.trim()) router.push(`/patients?q=${encodeURIComponent(query.trim())}`);
          }}
          role="search"
        >
          <div className="flex h-[46px] items-center gap-2 rounded-[8px] border border-line bg-white px-6">
            <Search size={20} strokeWidth={1.6} className="shrink-0 text-ink-soft" aria-hidden />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => window.setTimeout(() => setFocused(false), 120)}
              placeholder="Search patients, reports ..."
              aria-label="Search patients and reports"
              className="h-full w-full min-w-0 bg-transparent text-[14px] leading-[17.6px] font-normal text-ink placeholder:text-muted focus:outline-none"
            />
          </div>
        </form>

        {focused && query.trim() ? (
          <div className="animate-pop absolute top-[52px] right-0 left-0 z-40 overflow-hidden rounded-[12px] border border-line bg-white shadow-[0_18px_40px_-24px_rgba(24,37,34,0.45)]">
            {results.length === 0 ? (
              <p className="px-5 py-4 text-[13px] text-ink-soft">No patients match “{query.trim()}”.</p>
            ) : (
              <ul className="divide-y divide-line-soft">
                {results.map((entry) => {
                  const meta = statusMeta[entry.status];
                  return (
                    <li key={entry.slug}>
                      <Link
                        href={`/patients/${entry.slug}`}
                        className="flex items-center justify-between gap-4 px-5 py-3 hover:bg-surface-muted"
                      >
                        <span className="flex flex-col">
                          <span className="text-[14px] leading-[18px] font-medium text-ink">{entry.name}</span>
                          <span className="text-[12px] leading-[15px] text-muted">{entry.id}</span>
                        </span>
                        <span className={cn("rounded-pill px-2.5 py-1 text-[11px] leading-none", meta.className)}>
                          {meta.label}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
            <Link
              href={`/patients?q=${encodeURIComponent(query.trim())}`}
              className="block border-t border-line-soft px-5 py-3 text-[12px] font-medium text-brand hover:bg-surface-muted"
            >
              View all results
            </Link>
          </div>
        ) : null}
      </div>

      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        <IconLink href="/messages" label="Messages" className="hidden sm:grid">
          <MessageSquare size={18} strokeWidth={1.6} />
        </IconLink>
        <IconLink href="/reports" label="Announcements" className="hidden md:grid">
          <Megaphone size={18} strokeWidth={1.6} />
        </IconLink>
        <IconLink href="/notifications" label="Notifications">
          <Bell size={18} strokeWidth={1.6} />
          {unreadCount > 0 ? (
            <span className="absolute -top-1.5 -right-1.5 grid h-5 min-w-5 place-items-center rounded-full border border-white bg-danger-soft px-1 text-[10px] font-medium text-danger">
              {unreadCount}
            </span>
          ) : null}
        </IconLink>
        <IconLink href="/help" label="Help and support">
          <HelpCircle size={18} strokeWidth={1.6} />
        </IconLink>
        <Link href="/profile" aria-label="Your profile" className="focus-ring rounded-full">
          <Avatar name="Adika Nwosu" size={40} />
        </Link>
      </div>
    </div>
  );
}
