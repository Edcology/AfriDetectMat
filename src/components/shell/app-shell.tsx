"use client";

import { useState, type ReactNode } from "react";
import { X } from "lucide-react";
import { Sidebar } from "@/components/shell/sidebar";
import { Topbar, type SearchEntry } from "@/components/shell/topbar";

export function AppShell({
  children,
  searchIndex,
  unreadCount,
  alertCount,
}: {
  children: ReactNode;
  searchIndex: SearchEntry[];
  unreadCount: number;
  alertCount: number;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="flex min-h-dvh bg-canvas">
      <div className="sticky top-0 hidden h-dvh shrink-0 lg:block">
        <Sidebar alertCount={alertCount} />
      </div>

      {menuOpen ? (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <button
            type="button"
            aria-label="Close navigation"
            onClick={() => setMenuOpen(false)}
            className="animate-fade absolute inset-0 bg-[#182522]/60"
          />
          <div className="animate-pop relative h-full">
            <Sidebar onNavigate={() => setMenuOpen(false)} alertCount={alertCount} />
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              aria-label="Close navigation"
              className="absolute top-7 right-4 grid size-8 place-items-center rounded-[8px] bg-white/10 text-white"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      ) : null}

      <div className="flex min-h-dvh min-w-0 flex-1 flex-col">
        <div className="px-4 sm:px-6 lg:px-8">
          <Topbar
            searchIndex={searchIndex}
            unreadCount={unreadCount}
            onOpenMenu={() => setMenuOpen(true)}
          />
        </div>
        <main className="min-w-0 flex-1 px-4 pb-14 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
