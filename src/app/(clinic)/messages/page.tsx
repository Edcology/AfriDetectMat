import Link from "next/link";
import { MessagesSquare } from "lucide-react";
import { CareComposer } from "@/components/messages/care-composer";
import { Avatar } from "@/components/ui/avatar";
import { PageHeader } from "@/components/ui/card";
import { UnderlineTabs } from "@/components/ui/tabs";
import { clock, relativeDay } from "@/lib/format";
import { getDb } from "@/lib/store";
import { cn } from "@/lib/utils";

export const instant = false;
export const metadata = { title: "Messages" };

export default async function ClinicMessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ thread?: string }>;
}) {
  const { thread: requested } = await searchParams;
  const db = await getDb();
  const thread = db.threads.find((entry) => entry.id === requested) ?? db.threads[0];
  const messages = db.messages.filter((message) => message.threadId === thread.id);
  const unread = db.threads.reduce((total, entry) => total + entry.unread, 0);

  let lastDay = "";

  return (
    <div className="flex flex-col gap-6 pt-2">
      <PageHeader
        title="Messages"
        subtitle={`${unread} unread · replies reach the mother in her app`}
      />

      <UnderlineTabs
        active="My patients"
        items={[
          { href: "/messages", label: "My patients", count: unread },
          { href: "/alerts", label: "Escalations" },
        ]}
      />

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
        <div className="flex flex-col gap-4">
          {db.threads.map((entry) => {
            const last = db.messages.filter((message) => message.threadId === entry.id).at(-1);
            const active = entry.id === thread.id;
            return (
              <Link
                key={entry.id}
                href={`/messages?thread=${entry.id}`}
                className={cn(
                  "rounded-[16px] border px-5 py-4 transition-colors",
                  active ? "border-brand/40 bg-brand-mist/40" : "border-line bg-white hover:bg-[#fbfcfb]"
                )}
              >
                <div className="flex items-start gap-3">
                  <Avatar name={entry.name} size={36} tone="soft" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-3">
                      <p className="truncate text-[15px] font-medium text-ink">{entry.name}</p>
                      <span className="shrink-0 text-[11px] text-muted">
                        {last ? relativeDay(new Date(last.at)) : ""}
                      </span>
                    </div>
                    <p className="text-[12px] text-ink-soft">
                      {entry.role} · {entry.note}
                    </p>
                    <p className="mt-2 truncate text-[12px] text-ink-soft">{last?.body ?? "No messages yet"}</p>
                  </div>
                </div>
              </Link>
            );
          })}

          <div className="rounded-[16px] border border-line bg-white px-5 py-4">
            <div className="flex items-center gap-3">
              <span className="grid size-9 place-items-center rounded-full bg-surface-muted text-ink-soft">
                <MessagesSquare size={16} />
              </span>
              <div>
                <p className="text-[14px] font-medium text-ink">Replies are audited</p>
                <p className="text-[12px] leading-[17px] text-ink-soft">
                  Anything sent here appears in the mother&apos;s app and in her notification list.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex min-h-[560px] flex-col overflow-hidden rounded-[16px] border border-line bg-white">
          <div className="flex items-center gap-3 border-b border-line-soft px-5 py-4">
            <Avatar name={thread.name} size={36} tone="soft" />
            <div>
              <p className="text-[15px] font-medium text-ink">{thread.name}</p>
              <p className="text-[12px] text-ink-soft">
                {thread.role} · {thread.note}
              </p>
            </div>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto px-5 py-5">
            {messages.map((message) => {
              const day = relativeDay(new Date(message.at));
              const showDay = day !== lastDay;
              lastDay = day;
              const mine = message.from === "care";
              return (
                <div key={message.id}>
                  {showDay ? (
                    <div className="my-4 flex items-center gap-3">
                      <span className="h-px flex-1 bg-line-soft" />
                      <span className="text-[11px] text-muted">{day}</span>
                      <span className="h-px flex-1 bg-line-soft" />
                    </div>
                  ) : null}
                  <div className={cn("flex", mine ? "justify-end" : "justify-start")}>
                    <div
                      className={cn(
                        "max-w-[78%] rounded-[12px] px-4 py-3",
                        mine ? "bg-brand text-white" : "bg-[#e3f0e8] text-ink"
                      )}
                    >
                      <p className="text-[13px] leading-[19px]">{message.body}</p>
                      <p className={cn("mt-1 text-right text-[10px]", mine ? "text-white/70" : "text-muted")}>
                        {clock(new Date(message.at))}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <CareComposer threadId={thread.id} />
        </div>
      </div>
    </div>
  );
}
