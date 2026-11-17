import Link from "next/link";
import { StatusBadge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/card";
import { Table, TBody, TD, TH, THead, TR, TableWrap } from "@/components/ui/table";
import { gestationalAge } from "@/lib/format";
import { glucoseProtocol, protocol, screenForHypertension } from "@/lib/screening";
import { getDb } from "@/lib/store";

export const metadata = { title: "Screening & AI" };

export default async function ScreeningPage() {
  const db = await getDb();

  const rows = db.patients
    .map((patient) => ({ patient, result: screenForHypertension(patient) }))
    .sort((a, b) => {
      const weight = { urgent: 0, review: 1, "more-data": 2, routine: 3 } as const;
      return weight[a.result.severity] - weight[b.result.severity];
    });

  const counts = {
    urgent: rows.filter((row) => row.result.severity === "urgent").length,
    review: rows.filter((row) => row.result.severity === "review").length,
    moreData: rows.filter((row) => row.result.severity === "more-data").length,
  };

  return (
    <div className="flex flex-col gap-6 pt-2">
      <PageHeader
        title="Clinical screening & AI"
        subtitle={
          <span className="inline-flex rounded-pill bg-brand-mist px-3 py-2 text-[13px] leading-[16px] text-brand-deep">
            {protocol.name} · two readings at least 4 hours apart
          </span>
        }
      />

      <div className="grid gap-4 xl:grid-cols-2">
        <div className="rounded-card border border-line bg-white px-6 py-5">
          <h2 className="text-[20px] leading-[25px] font-semibold tracking-[-0.2px] text-ink">Hypertension in pregnancy</h2>
          <ul className="mt-4 flex flex-col gap-2">
            {protocol.rules.map((rule) => (
              <li key={rule} className="flex gap-2 text-[16px] leading-[22px] font-normal text-ink-soft">
                <span className="mt-2 size-1 shrink-0 rounded-full bg-ink-soft/70" />
                {rule}
              </li>
            ))}
          </ul>
          <button
            type="button"
            className="mt-5 inline-flex h-[42px] items-center rounded-[8px] border border-line bg-white px-6 text-[14px] font-medium text-ink-soft hover:text-ink"
          >
            Change protocol
          </button>
        </div>

        <div className="rounded-card border border-line bg-white px-6 py-5">
          <h2 className="text-[20px] leading-[25px] font-semibold tracking-[-0.2px] text-ink">{glucoseProtocol.headline}</h2>
          <ul className="mt-4 flex flex-col gap-2">
            {glucoseProtocol.rules.map((rule) => (
              <li key={rule} className="flex gap-2 text-[16px] leading-[22px] font-normal text-ink-soft">
                <span className="mt-2 size-1 shrink-0 rounded-full bg-ink-soft/70" />
                {rule}
              </li>
            ))}
          </ul>
          <p className="mt-6 text-[13px] leading-[19px] text-muted">{glucoseProtocol.footnote}</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-card border border-line bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 pt-5 pb-3">
          <h2 className="card-title">Screening queue</h2>
          <p className="text-[12px] text-ink-soft">
            {counts.urgent} urgent · {counts.review} review recommended · {counts.moreData} need more data
          </p>
        </div>
        <TableWrap>
          <Table>
            <THead>
              <TH className="w-[20%]">Patient</TH>
              <TH className="w-[18%]">Results</TH>
              <TH className="w-[40%]">Why</TH>
              <TH>More data needed</TH>
            </THead>
            <TBody>
              {rows.map(({ patient, result }) => (
                <TR key={patient.id}>
                  <TD>
                    <Link href={`/patients/${patient.slug}`} className="flex flex-col hover:underline">
                      <span>{patient.name}</span>
                      <span className="text-[12px] leading-[15px] text-muted">
                        {gestationalAge(patient.weeks, patient.days)}
                      </span>
                    </Link>
                  </TD>
                  <TD>
                    <StatusBadge status={result.severity} />
                  </TD>
                  <TD className="text-ink-soft">{result.reasons.join(" · ")}</TD>
                  <TD className={result.moreData ? "text-warn" : "text-ink-soft"}>{result.moreData ?? "None"}</TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </TableWrap>
      </div>

      <p className="text-[12px] leading-[18px] text-muted">
        Screening suggestions are decision support, not a diagnosis. A missing result is never treated as normal and every
        suggestion is signed off by a clinician.
      </p>
    </div>
  );
}

export const instant = false;
