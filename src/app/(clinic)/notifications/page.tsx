import { BellRing, CheckCheck, ClipboardList, MessageSquare, Settings2 } from "lucide-react";
import { markNotificationsRead } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/card";
import { clock, relativeDay } from "@/lib/format";
import { getDb } from "@/lib/store";
import type { AppNotification } from "@/lib/types";

export const metadata = { title: "Notifications" };

const icons: Record<AppNotification["kind"], typeof BellRing> = {
  alert: BellRing,
  message: MessageSquare,
  referral: ClipboardList,
  system: Settings2,
};

export default async function NotificationsPage() {
  const db = await getDb();
  const unread = db.notifications.filter((notification) => !notification.read).length;

  return (
    <div className="flex flex-col gap-6 pt-2">
      <PageHeader
        title="Notifications"
        subtitle={`${unread} unread`}
        actions={
          unread > 0 ? (
            <form action={markNotificationsRead}>
              <Button type="submit" variant="secondary">
                <CheckCheck size={16} /> Mark all read
              </Button>
            </form>
          ) : null
        }
      />

      <div className="overflow-hidden rounded-card border border-line bg-white">
        {db.notifications.map((notification) => {
          const Icon = icons[notification.kind];
          return (
            <div
              key={notification.id}
              className={`flex items-start gap-4 border-b border-line-soft px-6 py-5 last:border-0 ${
                notification.read ? "" : "bg-[#fbfdfc]"
              }`}
            >
              <span
                className={`mt-0.5 grid size-9 shrink-0 place-items-center rounded-full ${
                  notification.kind === "alert" ? "bg-danger-soft text-danger" : "bg-brand-mist text-brand-deep"
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
      </div>
    </div>
  );
}

export const instant = false;
