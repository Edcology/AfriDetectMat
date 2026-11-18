import Link from "next/link";
import { BellRing, CalendarDays, ClipboardList, MessageSquare } from "lucide-react";
import { markNotificationsRead } from "@/app/actions";
import { MotherHeader } from "@/components/mother/ui";
import { clock, relativeDay } from "@/lib/format";
import { getDb } from "@/lib/store";
import type { AppNotification } from "@/lib/types";

export const instant = false;
export const metadata = { title: "Notifications" };

const icons: Record<AppNotification["kind"], typeof BellRing> = {
  alert: BellRing,
  message: MessageSquare,
  referral: ClipboardList,
  system: CalendarDays,
};

export default async function MotherNotificationsPage() {
  const db = await getDb();
  const items = [...db.notifications].sort((a, b) => b.at.localeCompare(a.at));
  const unread = items.filter((notification) => !notification.read).length;

  return (
    <div className="flex flex-col gap-6">
      <MotherHeader
        title="Notifications"
        subtitle={unread > 0 ? `${unread} new since your last visit` : "You're up to date"}
        actions={
          unread > 0 ? (
            <form action={markNotificationsRead}>
              <button
                type="submit"
                className="inline-flex h-[42px] items-center rounded-[8px] border border-line bg-white px-4 text-[14px] text-ink-soft hover:text-ink"
              >
                Mark all read
              </button>
            </form>
          ) : null
        }
      />

      <div className="overflow-hidden rounded-[16px] border border-line bg-white">
        {items.map((notification) => {
          const Icon = icons[notification.kind] ?? BellRing;
          return (
            <div
              key={notification.id}
              className={`flex items-start gap-4 border-b border-line-soft px-6 py-5 last:border-0 ${
                notification.read ? "" : "bg-[#fbfdfc]"
              }`}
            >
              <span
                className={`mt-0.5 grid size-9 shrink-0 place-items-center rounded-full ${
                  notification.kind === "alert" ? "bg-warn-soft text-warn" : "bg-brand-mist text-brand-deep"
                }`}
              >
                <Icon size={16} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-[15px] font-medium text-ink">{notification.title}</p>
                  {notification.read ? null : <span className="size-1.5 rounded-full bg-brand-accent" />}
                </div>
                <p className="mt-1 text-[13px] leading-[19px] text-ink-soft">{notification.body}</p>
                <p className="mt-1 text-[11px] text-muted">
                  {relativeDay(new Date(notification.at))} · {clock(new Date(notification.at))}
                </p>
              </div>
            </div>
          );
        })}

        {items.length === 0 ? (
          <p className="px-6 py-10 text-center text-[13px] text-ink-soft">Nothing here yet.</p>
        ) : null}
      </div>

      <p className="text-[11px] leading-[17px] text-muted">
        Appointment reminders and replies from your care team appear here.{" "}
        <Link href="/mother/messages" className="font-medium text-brand hover:underline">
          Open messages
        </Link>
      </p>
    </div>
  );
}
