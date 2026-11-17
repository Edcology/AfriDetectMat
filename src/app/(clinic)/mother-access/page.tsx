import Link from "next/link";
import { Check, ShieldCheck, X } from "lucide-react";
import { resolveAccessRequest } from "@/app/actions";
import { Pill } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/card";
import { relativeDay, clock } from "@/lib/format";
import { getDb } from "@/lib/store";

export const metadata = { title: "Mother access" };

export default async function MotherAccessPage() {
  const db = await getDb();
  const sorted = [...db.accessRequests].sort((a, b) => {
    if (a.status !== b.status) return a.status === "pending" ? -1 : 1;
    return b.requestedAt.localeCompare(a.requestedAt);
  });
  const pending = sorted.filter((request) => request.status === "pending");

  return (
    <div className="flex flex-col gap-6 pt-2">
      <PageHeader
        title="Mother access"
        subtitle={`${pending.length} request${pending.length === 1 ? "" : "s"} waiting · the mother decides who sees her record`}
      />

      <div className="rounded-card border border-line bg-brand-mist px-6 py-5">
        <div className="flex items-start gap-3">
          <ShieldCheck size={18} className="mt-0.5 shrink-0 text-brand-deep" />
          <div>
            <p className="text-[15px] font-medium text-brand-deep">Consent stays with the patient</p>
            <p className="mt-1 text-[13px] leading-[19px] text-brand-deep/80">
              Access is granted for a named purpose and expires automatically. Revoking access takes effect immediately on
              every device.
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {sorted.map((request) => {
          const patient = db.patients.find((entry) => entry.id === request.patientId);
          return (
            <div
              key={request.id}
              className="flex flex-wrap items-center justify-between gap-5 rounded-card border border-line bg-white px-6 py-5"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <Link
                    href={patient ? `/patients/${patient.slug}` : "/patients"}
                    className="text-[16px] font-medium text-ink hover:underline"
                  >
                    {request.patientName}
                  </Link>
                  <span className="rounded-[4px] bg-surface-muted px-1.5 py-0.5 text-[12px] text-ink-soft">
                    {request.patientId}
                  </span>
                  <Pill
                    tone={request.status === "granted" ? "success" : request.status === "declined" ? "danger" : "warn"}
                  >
                    {request.status}
                  </Pill>
                </div>
                <p className="mt-1 text-[14px] text-ink">{request.scope}</p>
                <p className="mt-1 text-[13px] text-ink-soft">{request.note}</p>
                <p className="mt-1 text-[11px] text-muted">
                  {relativeDay(new Date(request.requestedAt))} · {clock(new Date(request.requestedAt))}
                </p>
              </div>

              {request.status === "pending" ? (
                <div className="flex items-center gap-2">
                  <form action={resolveAccessRequest}>
                    <input type="hidden" name="requestId" value={request.id} />
                    <input type="hidden" name="decision" value="declined" />
                    <button
                      type="submit"
                      className="focus-ring inline-flex h-[33px] items-center gap-2 rounded-[8px] border border-line bg-white px-4 text-[12px] text-ink-soft hover:text-ink"
                    >
                      <X size={13} /> Decline
                    </button>
                  </form>
                  <form action={resolveAccessRequest}>
                    <input type="hidden" name="requestId" value={request.id} />
                    <input type="hidden" name="decision" value="granted" />
                    <button
                      type="submit"
                      className="focus-ring inline-flex h-[33px] items-center gap-2 rounded-[8px] bg-brand px-4 text-[12px] font-medium text-white hover:bg-[#093f3b]"
                    >
                      <Check size={13} /> Grant access
                    </button>
                  </form>
                </div>
              ) : (
                <Link href={patient ? `/patients/${patient.slug}` : "/patients"} className="text-[12px] font-medium text-brand hover:underline">
                  Open record
                </Link>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export const instant = false;
