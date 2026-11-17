import Link from "next/link";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { StatusBadge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/card";
import { Table, TBody, TD, TH, THead, TR, TableWrap } from "@/components/ui/table";
import { clock, relativeDay } from "@/lib/format";
import { screenForHypertension } from "@/lib/screening";
import { getDb } from "@/lib/store";

export const metadata = { title: "Reports" };

/** Weekly check-in volume — deterministic sample for the reporting period. */
const weeks = [
  { label: "12 Oct", value: 38 },
  { label: "19 Oct", value: 46 },
  { label: "26 Oct", value: 41 },
  { label: "2 Nov", value: 54 },
  { label: "9 Nov", value: 62 },
  { label: "16 Nov", value: 57 },
];

export default async function ReportsPage() {
  const db = await getDb();
  const screened = db.patients.map((patient) => ({ patient, result: screenForHypertension(patient) }));
  const urgent = screened.filter((row) => row.result.severity === "urgent").length;
  const review = screened.filter((row) => row.result.severity === "review").length;
  const routine = screened.filter((row) => row.result.severity === "routine").length;
  const moreData = screened.filter((row) => row.result.severity === "more-data").length;

  const total = screened.length || 1;
  const maxWeek = Math.max(...weeks.map((week) => week.value));

  const kpis = [
    { label: "Patients under care", value: db.patients.length, delta: "+1", up: true },
    { label: "Check-ins this week", value: 57, delta: "-8%", up: false },
    { label: "Screening coverage", value: `${Math.round(((total - moreData) / total) * 100)}%`, delta: "+6 pts", up: true },
    { label: "Referral turnaround", value: "31h", delta: "-4h", up: true },
  ];

  return (
    <div className="flex flex-col gap-6 pt-2">
      <PageHeader title="Reports" subtitle="Antenatal screening summary · 16 November 2026" />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="rounded-card border border-line bg-white px-6 py-5">
            <p className="label-xs">{kpi.label}</p>
            <div className="mt-3 flex items-end justify-between gap-3">
              <p className="text-[32px] leading-[40px] font-bold text-ink">{kpi.value}</p>
              <p
                className={`inline-flex items-center gap-1 text-[12px] font-medium ${
                  kpi.up ? "text-success" : "text-warn"
                }`}
              >
                {kpi.up ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
                {kpi.delta}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid items-start gap-5 xl:grid-cols-[1.3fr_1fr]">
        <div className="rounded-card border border-line bg-white px-6 py-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="card-title">Check-ins per week</h2>
            <span className="text-[12px] text-muted">Last 6 weeks</span>
          </div>
          <div className="mt-6 flex h-[190px] items-end gap-4">
            {weeks.map((week) => (
              <div key={week.label} className="flex flex-1 flex-col items-center gap-2">
                <span className="text-[11px] font-medium text-ink-soft">{week.value}</span>
                <div
                  className="w-full rounded-t-[6px] bg-brand-tint"
                  style={{ height: `${Math.round((week.value / maxWeek) * 140)}px` }}
                />
                <span className="text-[11px] text-muted">{week.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-card border border-line bg-white px-6 py-5">
          <h2 className="card-title">Screening outcomes</h2>
          <div className="mt-5 flex flex-col gap-4">
            {[
              { tone: "urgent" as const, count: urgent },
              { tone: "review" as const, count: review },
              { tone: "more-data" as const, count: moreData },
              { tone: "routine" as const, count: routine },
            ].map((row) => (
              <div key={row.tone} className="flex items-center gap-4">
                <StatusBadge status={row.tone} />
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-muted">
                  <div
                    className={`h-full rounded-full ${
                      row.tone === "urgent"
                        ? "bg-danger"
                        : row.tone === "review"
                          ? "bg-warn"
                          : row.tone === "more-data"
                            ? "bg-info"
                            : "bg-success"
                    }`}
                    style={{ width: `${Math.round((row.count / total) * 100)}%` }}
                  />
                </div>
                <span className="w-6 text-right text-[13px] font-medium text-ink">{row.count}</span>
              </div>
            ))}
          </div>
          <p className="mt-5 text-[12px] leading-[18px] text-muted">
            {moreData} patient{moreData === 1 ? "" : "s"} still missing a urine protein result. A missing result is never
            treated as normal.
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-card border border-line bg-white">
        <div className="flex items-center justify-between px-6 pt-5 pb-3">
          <h2 className="card-title">Patient screening ledger</h2>
          <Link href="/screening" className="text-[12px] font-medium text-brand hover:underline">
            Open screening queue
          </Link>
        </div>
        <TableWrap>
          <Table>
            <THead>
              <TH className="w-[26%]">Patient</TH>
              <TH className="w-[22%]">Latest reading</TH>
              <TH className="w-[22%]">Outcome</TH>
              <TH className="w-[16%]">Urine protein</TH>
              <TH>Last check-in</TH>
            </THead>
            <TBody>
              {screened.map(({ patient, result }) => (
                <TR key={patient.id}>
                  <TD>
                    <Link href={`/patients/${patient.slug}`} className="hover:underline">
                      {patient.name}
                    </Link>
                  </TD>
                  <TD>
                    {result.latest ? `${result.latest.systolic}/${result.latest.diastolic} mmHg` : "No reading"}
                  </TD>
                  <TD>
                    <StatusBadge status={result.severity} />
                  </TD>
                  <TD className={patient.urineProtein ? "text-ink-soft" : "text-warn"}>
                    {patient.urineProtein ?? "Outstanding"}
                  </TD>
                  <TD className="whitespace-nowrap text-ink-soft">
                    {relativeDay(new Date(patient.lastCheckIn))} · {clock(new Date(patient.lastCheckIn))}
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </TableWrap>
      </div>
    </div>
  );
}

export const instant = false;
