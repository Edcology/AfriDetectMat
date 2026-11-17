import Link from "next/link";
import { BellOff, Check } from "lucide-react";
import { acknowledgeAlert } from "@/app/actions";
import { StatusBadge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/card";
import { ChipLinks } from "@/components/ui/tabs";
import { clinicianName } from "@/lib/data";
import { clock, relativeDay } from "@/lib/format";
import { getDb } from "@/lib/store";

export const metadata = { title: "Alerts" };

export default async function AlertsPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const { filter = "all" } = await searchParams;
  const db = await getDb();

  const visible = db.alerts
    .filter((alert) => {
      if (filter === "open") return !alert.acknowledged;
      if (filter === "urgent") return alert.severity === "urgent";
      return true;
    })
    .sort((a, b) => {
      if (a.acknowledged !== b.acknowledged) return a.acknowledged ? 1 : -1;
      const weight = { urgent: 0, review: 1, routine: 2, "more-data": 3 } as const;
      if (weight[a.severity] !== weight[b.severity]) return weight[a.severity] - weight[b.severity];
      return b.at.localeCompare(a.at);
    });

  const open = db.alerts.filter((alert) => !alert.acknowledged).length;

  return (
    <div className="flex flex-col gap-6 pt-2">
      <PageHeader
        title="Alerts"
        subtitle={`${open} awaiting acknowledgement · screening never closes an alert on its own`}
      />

      <ChipLinks
        items={[
          { href: "/alerts", label: "All" },
          { href: "/alerts?filter=open", label: "Unacknowledged" },
          { href: "/alerts?filter=urgent", label: "Urgent" },
        ]}
        active={filter === "open" ? "Unacknowledged" : filter === "urgent" ? "Urgent" : "All"}
      />

      <div className="flex flex-col gap-3">
        {visible.map((alert) => (
          <div
            key={alert.id}
            className="flex flex-wrap items-start justify-between gap-5 rounded-card border border-line bg-white px-6 py-5"
          >
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href={`/patients/${db.patients.find((p) => p.id === alert.patientId)?.slug ?? ""}`}
                  className="text-[16px] font-medium text-ink hover:underline"
                >
                  {alert.patientName}
                </Link>
                <StatusBadge status={alert.severity} />
                {alert.acknowledged ? (
                  <span className="inline-flex items-center gap-1 text-[12px] text-success">
                    <Check size={12} /> Acknowledged
                  </span>
                ) : null}
              </div>
              <p className="text-[16px] leading-[21px] text-ink">{alert.title}</p>
              <p className="max-w-3xl text-[13px] leading-[19px] text-ink-soft">{alert.detail}</p>
              <p className="text-[11px] text-muted">
                {relativeDay(new Date(alert.at))} · {clock(new Date(alert.at))} ·{" "}
                {alert.assignedTo ? clinicianName(alert.assignedTo) : "Unassigned"}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href={`/patients/${db.patients.find((p) => p.id === alert.patientId)?.slug ?? ""}`}
                className="inline-flex h-[33px] items-center rounded-[8px] border border-line bg-white px-4 text-[12px] text-ink-soft hover:text-ink"
              >
                Review patient
              </Link>
              {alert.acknowledged ? null : (
                <form action={acknowledgeAlert}>
                  <input type="hidden" name="alertId" value={alert.id} />
                  <button
                    type="submit"
                    className="focus-ring inline-flex h-[33px] items-center gap-2 rounded-[8px] bg-brand px-4 text-[12px] font-medium text-white hover:bg-[#093f3b]"
                  >
                    <Check size={13} /> Acknowledge
                  </button>
                </form>
              )}
            </div>
          </div>
        ))}

        {visible.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-card border border-line bg-white px-6 py-16 text-center">
            <BellOff size={22} className="text-muted" />
            <p className="text-[14px] text-ink">Nothing here.</p>
            <p className="text-[13px] text-ink-soft">Every alert in this view has been acknowledged.</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export const instant = false;
