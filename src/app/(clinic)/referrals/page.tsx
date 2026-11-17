import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { SendReferralButton } from "@/components/patients/patient-forms";
import { Pill } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/card";
import { Table, TBody, TD, TH, THead, TR, TableWrap } from "@/components/ui/table";
import { relativeDay, clock } from "@/lib/format";
import { getDb } from "@/lib/store";

export const metadata = { title: "Referrals" };

export default async function ReferralsPage() {
  const db = await getDb();
  const rows = [...db.referrals].sort((a, b) => b.at.localeCompare(a.at));

  const counts = {
    inProgress: rows.filter((row) => row.state === "in-progress").length,
    accepted: rows.filter((row) => row.state === "accepted").length,
    closed: rows.filter((row) => row.state === "closed").length,
  };

  return (
    <div className="flex flex-col gap-6 pt-2">
      <PageHeader
        title="Referrals"
        subtitle={`${counts.inProgress} in progress · ${counts.accepted} accepted · ${counts.closed} closed`}
        actions={
          <SendReferralButton
            patients={db.patients.map(({ id, name }) => ({ id, name }))}
            label="Send referral"
          />
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "In progress", value: counts.inProgress, tone: "warn" as const },
          { label: "Accepted", value: counts.accepted, tone: "success" as const },
          { label: "Closed", value: counts.closed, tone: "neutral" as const },
        ].map((card) => (
          <div key={card.label} className="rounded-card border border-line bg-white px-6 py-5">
            <p className="label-xs">{card.label}</p>
            <p className="mt-2 text-[32px] leading-[40px] font-bold text-ink">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-card border border-line bg-white">
        <TableWrap>
          <Table>
            <THead>
              <TH className="w-[18%]">Patient</TH>
              <TH className="w-[26%]">Destination</TH>
              <TH className="w-[28%]">Reason</TH>
              <TH className="w-[14%]">Sent</TH>
              <TH className="w-[10%]">Urgency</TH>
              <TH>Status</TH>
            </THead>
            <TBody>
              {rows.map((referral) => {
                const patient = db.patients.find((entry) => entry.id === referral.patientId);
                return (
                  <TR key={referral.id}>
                    <TD>
                      <Link href={patient ? `/patients/${patient.slug}?tab=referral` : "/patients"} className="hover:underline">
                        {referral.patientName}
                      </Link>
                    </TD>
                    <TD className="text-ink-soft">{referral.destination}</TD>
                    <TD className="text-ink-soft">{referral.reason}</TD>
                    <TD>
                      {relativeDay(new Date(referral.at))} {clock(new Date(referral.at))}
                    </TD>
                    <TD>
                      <Pill tone={referral.urgency === "urgent" ? "danger" : "neutral"}>{referral.urgency}</Pill>
                    </TD>
                    <TD>
                      <Pill tone={referral.state === "accepted" ? "success" : referral.state === "closed" ? "neutral" : "warn"}>
                        {referral.state.replace("-", " ")}
                      </Pill>
                    </TD>
                  </TR>
                );
              })}
            </TBody>
          </Table>
        </TableWrap>
        {rows.length === 0 ? <p className="px-6 py-10 text-center text-[13px] text-ink-soft">No referrals yet.</p> : null}
      </div>

      <div className="rounded-card border border-line bg-brand-mist px-6 py-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-[16px] leading-[20px] font-medium text-brand-deep">Closing the loop</p>
            <p className="mt-1 text-[13px] text-brand-deep/80">
              A referral stays open until the receiving facility confirms it. Overdue referrals are escalated after 48 hours.
            </p>
          </div>
          <Link href="/reports" className="inline-flex items-center gap-1 text-[13px] font-medium text-brand-deep hover:underline">
            See referral turnaround <ArrowUpRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}

export const instant = false;
