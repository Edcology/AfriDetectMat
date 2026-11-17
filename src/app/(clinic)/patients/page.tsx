import Link from "next/link";
import { Search } from "lucide-react";
import { AddPatientButton } from "@/components/forms/add-patient-dialog";
import { SortSelects } from "@/components/patients/sort-selects";
import { StatusBadge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/card";
import { ChipLinks } from "@/components/ui/tabs";
import { Table, TBody, TD, TH, THead, TR, TableWrap } from "@/components/ui/table";
import { clinicians, clinicianName, statusCounts } from "@/lib/data";
import { gestationalAge, relativeDay, clock } from "@/lib/format";
import { getDb } from "@/lib/store";
import type { ReviewStatus } from "@/lib/types";

export const metadata = { title: "Patients" };

const statusFilters: { key: string; label: string }[] = [
  { key: "all", label: "All" },
  { key: "urgent", label: "Urgent" },
  { key: "review", label: "Recommended" },
  { key: "routine", label: "Routine" },
  { key: "more-data", label: "More data" },
];

export default async function PatientsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string; stage?: string }>;
}) {
  const params = await searchParams;
  const status = params.status ?? "all";
  const query = (params.q ?? "").trim().toLowerCase();
  const stage = params.stage ?? "all";

  const db = await getDb();
  const counts = statusCounts(db.patients);

  const filtered = db.patients.filter((patient) => {
    if (status !== "all" && patient.status !== status) return false;
    if (query && !`${patient.name} ${patient.id}`.toLowerCase().includes(query)) return false;
    if (stage === "third" && patient.weeks < 28) return false;
    if (stage === "second" && (patient.weeks < 14 || patient.weeks >= 28)) return false;
    if (stage === "first" && patient.weeks >= 14) return false;
    return true;
  });

  const buildHref = (next: { status?: string; stage?: string }) => {
    const search = new URLSearchParams();
    const nextStatus = next.status ?? status;
    const nextStage = next.stage ?? stage;
    if (nextStatus !== "all") search.set("status", nextStatus);
    if (nextStage !== "all") search.set("stage", nextStage);
    if (query) search.set("q", query);
    const suffix = search.toString();
    return suffix ? `/patients?${suffix}` : "/patients";
  };

  return (
    <div className="flex flex-col gap-8 pt-2">
      <PageHeader
        title="Your Patients"
        subtitle={`${db.patients.length} registered · ${counts.urgent} urgent · ${counts.review} awaiting review`}
        actions={<AddPatientButton clinicians={clinicians.map(({ id, name }) => ({ id, name }))} />}
      />

      <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
        <ChipLinks
          items={statusFilters.map((filter) => ({
            href: buildHref({ status: filter.key }),
            label: filter.label,
          }))}
          active={statusFilters.find((filter) => filter.key === status)?.label ?? "All"}
        />

        <SortSelects />
      </div>

      {query ? (
        <p className="flex items-center gap-2 text-[13px] text-ink-soft">
          <Search size={14} /> {filtered.length} result{filtered.length === 1 ? "" : "s"} for “{params.q}”
          <Link href="/patients" className="ml-2 font-medium text-brand hover:underline">
            Clear
          </Link>
        </p>
      ) : null}

      <div className="overflow-hidden rounded-[8px] border border-line bg-white">
        <TableWrap>
          <Table>
            <THead variant="brand">
              <TH className="w-[28%]">Patients</TH>
              <TH className="w-[18%]">Pregnancy stage</TH>
              <TH className="w-[20%]">Clinician</TH>
              <TH className="w-[20%]">Last check-in</TH>
              <TH>Status</TH>
            </THead>
            <TBody>
              {filtered.map((patient) => {
                const lastCheckIn = new Date(patient.lastCheckIn);
                return (
                  <TR key={patient.id}>
                    <TD>
                      <Link href={`/patients/${patient.slug}`} className="flex flex-col hover:underline">
                        <span className="font-normal text-ink">{patient.name}</span>
                        <span className="text-[12px] leading-[15px] text-muted">{patient.id}</span>
                      </Link>
                    </TD>
                    <TD>{gestationalAge(patient.weeks, patient.days)}</TD>
                    <TD>{clinicianName(patient.clinicianId)}</TD>
                    <TD className="whitespace-nowrap">
                      {relativeDay(lastCheckIn)} · {clock(lastCheckIn)}
                    </TD>
                    <TD>
                      <StatusBadge status={patient.status as ReviewStatus} />
                    </TD>
                  </TR>
                );
              })}
            </TBody>
          </Table>
        </TableWrap>
        {filtered.length === 0 ? (
          <p className="px-6 py-10 text-center text-[14px] text-ink-soft">
            No patients match these filters.
          </p>
        ) : null}
      </div>
    </div>
  );
}

export const instant = false;
