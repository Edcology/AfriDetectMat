"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ChevronDown } from "lucide-react";

const selectClass =
  "h-[42px] appearance-none rounded-[8px] border border-line bg-white pr-9 pl-4 text-[14px] font-normal text-ink-soft focus:border-brand-accent focus:outline-none";

export function SortSelects() {
  const router = useRouter();
  const params = useSearchParams();

  const update = (key: string, value: string) => {
    const next = new URLSearchParams(params.toString());
    if (value === "all") next.delete(key);
    else next.set(key, value);
    const query = next.toString();
    router.push(query ? `/patients?${query}` : "/patients");
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="text-[16px] leading-[20px] font-normal text-ink">Sort by;</span>

      <div className="relative">
        <select
          aria-label="Filter by trimester"
          value={params.get("stage") ?? "all"}
          onChange={(event) => update("stage", event.target.value)}
          className={selectClass}
        >
          <option value="all">All trimesters</option>
          <option value="first">First trimester</option>
          <option value="second">Second trimester</option>
          <option value="third">Third trimester</option>
        </select>
        <ChevronDown size={14} className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-ink-soft" />
      </div>

      <div className="relative">
        <select
          aria-label="Filter by status"
          value={params.get("status") ?? "all"}
          onChange={(event) => update("status", event.target.value)}
          className={selectClass}
        >
          <option value="all">All statuses</option>
          <option value="urgent">Urgent</option>
          <option value="review">Recommended</option>
          <option value="routine">Routine</option>
          <option value="more-data">More data</option>
        </select>
        <ChevronDown size={14} className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-ink-soft" />
      </div>
    </div>
  );
}
