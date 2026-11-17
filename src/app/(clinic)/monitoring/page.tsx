import Link from "next/link";
import { QuickReadingForm } from "@/components/patients/quick-reading-form";
import { Pill, StatusBadge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/card";
import { Table, TBody, TD, TH, THead, TR, TableWrap } from "@/components/ui/table";
import { gestationalAge, clock, relativeDay } from "@/lib/format";
import { classifyReading } from "@/lib/screening";
import { getDb } from "@/lib/store";

export const metadata = { title: "Monitoring" };

export default async function MonitoringPage() {
  const db = await getDb();

  const rows = db.patients
    .flatMap((patient) => patient.readings.map((reading) => ({ patient, reading })))
    .sort((a, b) => b.reading.at.localeCompare(a.reading.at))
    .slice(0, 14);

  const reported = rows.filter((row) => row.reading.source === "patient").length;

  return (
    <div className="flex flex-col gap-6 pt-2">
      <PageHeader
        title="Monitoring"
        subtitle="Latest readings with source and data quality. Invalid values never enter screening silently."
      />

      <div className="overflow-hidden rounded-card border border-line bg-white">
        <TableWrap>
          <Table>
            <THead>
              <TH className="w-[22%]">Patient</TH>
              <TH className="w-[18%]">Latest systolic</TH>
              <TH className="w-[20%]">Source</TH>
              <TH className="w-[16%]">Recorded</TH>
              <TH className="w-[14%]">Data gaps</TH>
              <TH>Reviews</TH>
            </THead>
            <TBody>
              {rows.map(({ patient, reading }) => {
                const when = new Date(reading.at);
                const severity = classifyReading(reading.systolic, reading.diastolic);
                return (
                  <TR key={`${patient.id}-${reading.at}`}>
                    <TD>
                      <Link href={`/patients/${patient.slug}`} className="flex flex-col hover:underline">
                        <span>{patient.name}</span>
                        <span className="text-[12px] leading-[15px] text-muted">
                          {gestationalAge(patient.weeks, patient.days)}
                        </span>
                      </Link>
                    </TD>
                    <TD>
                      <span>
                        {reading.systolic}/{reading.diastolic}{" "}
                        <span className="text-[12px] text-muted">mmHg</span>
                      </span>
                    </TD>
                    <TD>
                      <Pill tone={reading.source === "clinician" ? "success" : "info"}>
                        {reading.source === "clinician" ? "Clinician - verified" : "Patient - reported"}
                      </Pill>
                    </TD>
                    <TD className="whitespace-nowrap">
                      {relativeDay(when)} {clock(when)}
                    </TD>
                    <TD className={`whitespace-nowrap ${patient.urineProtein ? "text-ink-soft" : "text-warn"}`}>
                      {patient.urineProtein ? "None" : "Urine protein"}
                    </TD>
                    <TD>
                      <StatusBadge status={severity} />
                    </TD>
                  </TR>
                );
              })}
            </TBody>
          </Table>
        </TableWrap>
      </div>

      <div className="rounded-card border border-line bg-white px-6 py-5">
        <h2 className="card-title">Try a reading</h2>
        <p className="mt-1 mb-4 text-[13px] text-ink-soft">
          A clinician-verified reading is screened immediately against Protocol A and, if raised, opens an alert.
        </p>
        <QuickReadingForm patients={db.patients.map(({ id, name }) => ({ id, name }))} />
      </div>

      <p className="text-[12px] text-muted">
        {rows.length} readings shown · {reported} patient-reported · values outside 60–260 / 30–160 mmHg are rejected at entry.
      </p>
    </div>
  );
}

export const instant = false;
