import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, FileText, Plus } from "lucide-react";
import { TrendLine } from "@/components/charts/trend-line";
import { ScheduleVisitButton } from "@/components/forms/schedule-visit-dialog";
import { CarePlanForm, NoteForm, SendReferralButton } from "@/components/patients/patient-forms";
import { Pill, StatusBadge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Card, SectionCard } from "@/components/ui/card";
import { Table, TBody, TD, TH, THead, TR, TableWrap } from "@/components/ui/table";
import { UnderlineTabs } from "@/components/ui/tabs";
import { clinicians, clinicianName } from "@/lib/data";
import { clock, dayTime, gestationalAge, relativeDay } from "@/lib/format";
import { screenForHypertension, protocol } from "@/lib/screening";
import { getDb } from "@/lib/store";

const tabs = [
  { key: "overview", label: "Overview" },
  { key: "health-records", label: "Health records" },
  { key: "labs", label: "Labs" },
  { key: "appointment", label: "Appointment" },
  { key: "care-plan", label: "Care-plan" },
  { key: "notes", label: "Notes" },
  { key: "referral", label: "Referral" },
  { key: "activity", label: "Activity" },
];

function ageLabel(weeks: number, days: number) {
  return gestationalAge(weeks, days);
}

function InfoCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-3 px-6 py-5">
      <span className="text-[16px] leading-[20px] font-normal text-ink-soft">{label}</span>
      <span className="text-[16px] leading-[20px] font-medium text-ink">{value}</span>
    </div>
  );
}

export default async function PatientPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const [{ slug }, { tab = "overview" }] = await Promise.all([params, searchParams]);
  const db = await getDb();
  const patient = db.patients.find((entry) => entry.slug === slug);
  if (!patient) notFound();

  const screening = screenForHypertension(patient);
  const patientAppointments = db.appointments
    .filter((appointment) => appointment.patientId === patient.id)
    .sort((a, b) => b.at.localeCompare(a.at));
  const patientReferrals = db.referrals.filter((referral) => referral.patientId === patient.id);
  const patientActivity = db.activities.filter((activity) => activity.subject === patient.name);
  const readings = [...patient.readings].sort((a, b) => a.at.localeCompare(b.at));
  const trend = readings.slice(-5).map((reading) => ({
    label: relativeDay(new Date(reading.at)),
    value: reading.systolic,
  }));
  const highest = readings.reduce((acc, reading) => Math.max(acc, reading.systolic), 0);

  const labs = [
    { name: "Haemoglobin", result: "11.2 g/dL", reference: "11.0 – 15.0 g/dL", tone: "success" as const },
    { name: "Platelets", result: "210 ×10⁹/L", reference: "150 – 400 ×10⁹/L", tone: "success" as const },
    {
      name: "Urine protein",
      result: patient.urineProtein ?? "Not recorded",
      reference: "Negative",
      tone: patient.urineProtein ? (patient.urineProtein === "Negative" ? ("success" as const) : ("warn" as const)) : ("info" as const),
    },
    { name: "Random plasma glucose", result: "4.8 mmol/L", reference: "Below 7.8 mmol/L", tone: "success" as const },
    { name: "Blood group & genotype", result: `${patient.bloodGroup} · ${patient.genotype}`, reference: "Recorded at booking", tone: "neutral" as const },
    { name: "HIV screening", result: "Non-reactive", reference: "Recorded at booking", tone: "success" as const },
  ];

  return (
    <div className="flex flex-col gap-6 pt-2">
      <Link
        href="/patients"
        className="inline-flex w-fit items-center gap-2 rounded-[8px] border border-line bg-white px-4 py-2.5 text-[14px] leading-[18px] font-normal text-ink-soft hover:text-ink"
      >
        <ChevronLeft size={16} strokeWidth={1.8} />
        Back to patients
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="page-title">{patient.name}</h1>
          <span className="text-[20px] leading-[25px] font-normal text-muted">{patient.id}</span>
          <StatusBadge status={patient.status} />
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <ScheduleVisitButton
            patients={[{ id: patient.id, name: patient.name }]}
            clinicians={clinicians.map(({ id, name }) => ({ id, name }))}
            defaultPatientId={patient.id}
            label="Schedule visit"
          />
          <SendReferralButton
            patients={[{ id: patient.id, name: patient.name }]}
            defaultPatientId={patient.id}
          />
        </div>
      </div>

      <UnderlineTabs
        active={tabs.find((entry) => entry.key === tab)?.label ?? "Overview"}
        items={tabs.map((entry) => ({
          href: `/patients/${patient.slug}?tab=${entry.key}`,
          label: entry.label,
        }))}
      />

      {tab === "overview" ? (
        <div className="flex flex-col gap-5">
          <Card className="grid divide-line-soft overflow-hidden sm:grid-cols-2 sm:divide-x xl:grid-cols-3 [&>*]:border-b [&>*]:border-line-soft [&>*:nth-last-child(-n+3)]:border-b-0 max-sm:[&>*:last-child]:border-b-0">
            <InfoCell label="Gestational age" value={ageLabel(patient.weeks, patient.days)} />
            <InfoCell label="Estimated delivery" value={patient.edd} />
            <InfoCell label="Age" value={`${patient.age} years`} />
            <InfoCell label="Assigned clinician" value={clinicianName(patient.clinicianId)} />
            <InfoCell label="Phone contact" value={patient.phone} />
            <InfoCell label="History" value={patient.history} />
          </Card>

          <div className="grid items-start gap-5 xl:grid-cols-[1.2fr_1fr]">
            <SectionCard title="Blood Pressure (Systolic)" bodyClassName="px-6 pt-2 pb-4">
              {trend.length > 1 ? (
                <TrendLine points={trend} height={150} />
              ) : (
                <p className="py-10 text-[13px] text-ink-soft">Not enough readings yet to draw a trend.</p>
              )}
              <div className="mt-3 flex flex-wrap items-center gap-6 text-[12px] leading-[15px] text-ink-soft">
                <span className="inline-flex items-center gap-2">
                  <span className="size-2 rounded-full bg-brand-accent" />
                  Latest: {screening.latest?.systolic ?? "—"} mmHg
                </span>
                <span className="inline-flex items-center gap-2">
                  <span className="size-2 rounded-full bg-danger" />
                  Highest: {highest || "—"} mmHg
                </span>
              </div>
            </SectionCard>

            <SectionCard title="Care Plan" bodyClassName="flex flex-col gap-6 px-6 pt-4 pb-5">
              <p className="text-[16px] leading-[22px] font-normal text-ink">{patient.carePlan}</p>
              <div className="mt-auto">
                <ButtonLink
                  href={`/patients/${patient.slug}?tab=care-plan`}
                  variant="secondary"
                  size="sm"
                >
                  Update care-plan
                </ButtonLink>
              </div>
            </SectionCard>
          </div>

          <Card className="px-6 py-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <h2 className="text-[20px] leading-[25px] font-semibold tracking-[-0.2px] text-ink">
                Hypertension screening
              </h2>
              <StatusBadge status={screening.severity} />
            </div>
            <ul className="mt-4 flex flex-col gap-2">
              {screening.reasons.map((reason) => (
                <li key={reason} className="flex gap-2 text-[16px] leading-[22px] font-normal text-ink">
                  <span className="mt-2 size-1 shrink-0 rounded-full bg-ink/60" />
                  {reason}
                </li>
              ))}
            </ul>
            <p className="mt-4 text-[14px] leading-[19px] text-ink">
              <span className="font-semibold">More data needed:</span>{" "}
              <span className="text-ink-soft">
                {screening.moreData ?? "None"}. A missing result is never treated as normal.
              </span>
            </p>
            <p className="mt-3 text-[12px] leading-[15px] text-muted">{protocol.name} · two readings at least 4 hours apart</p>
          </Card>
        </div>
      ) : null}

      {tab === "health-records" ? (
        <div className="grid items-start gap-5 xl:grid-cols-[1.4fr_1fr]">
          <Card className="overflow-hidden">
            <div className="flex items-center justify-between px-6 pt-5 pb-3">
              <h2 className="card-title">Blood pressure readings</h2>
              <Pill tone="brand">{readings.length} recorded</Pill>
            </div>
            <TableWrap>
              <Table>
                <THead>
                  <TH className="w-[28%]">Recorded</TH>
                  <TH className="w-[26%]">Reading</TH>
                  <TH className="w-[24%]">Source</TH>
                  <TH>Flag</TH>
                </THead>
                <TBody>
                  {[...readings].reverse().map((reading) => {
                    const date = new Date(reading.at);
                    const flag =
                      reading.systolic >= 160 || reading.diastolic >= 110
                        ? "urgent"
                        : reading.systolic >= 140 || reading.diastolic >= 90
                          ? "review"
                          : "routine";
                    return (
                      <TR key={reading.at}>
                        <TD>
                          <span className="flex flex-col">
                            <span>{relativeDay(date)}</span>
                            <span className="text-[12px] text-muted">{clock(date)}</span>
                          </span>
                        </TD>
                        <TD>
                          {reading.systolic}/{reading.diastolic} mmHg
                        </TD>
                        <TD className="text-ink-soft">
                          {reading.source === "clinician" ? "Clinician - verified" : "Patient - reported"}
                        </TD>
                        <TD>
                          <StatusBadge status={flag} />
                        </TD>
                      </TR>
                    );
                  })}
                </TBody>
              </Table>
            </TableWrap>
          </Card>

          <div className="flex flex-col gap-5">
            <SectionCard title="Recorded history" bodyClassName="flex flex-col gap-3 px-6 pt-4 pb-5">
              <p className="text-[14px] leading-[20px] text-ink">{patient.history}</p>
              <div className="grid grid-cols-2 gap-4 text-[13px]">
                <div>
                  <p className="text-muted">Gravida / Para</p>
                  <p className="mt-1 font-medium">
                    G{patient.gravida} P{patient.para}
                  </p>
                </div>
                <div>
                  <p className="text-muted">Blood group</p>
                  <p className="mt-1 font-medium">
                    {patient.bloodGroup} · {patient.genotype}
                  </p>
                </div>
              </div>
              {patient.allergies.length > 0 ? (
                <div className="rounded-[8px] bg-danger-soft px-4 py-3 text-[12px] text-danger">
                  Allergies: {patient.allergies.join(", ")}
                </div>
              ) : null}
            </SectionCard>

            <SectionCard title="Active risk factors" bodyClassName="flex flex-wrap gap-2 px-6 pt-4 pb-5">
              {patient.riskFactors.length === 0 ? (
                <p className="text-[13px] text-ink-soft">None recorded.</p>
              ) : (
                patient.riskFactors.map((factor) => (
                  <Pill key={factor} tone="warn">
                    {factor}
                  </Pill>
                ))
              )}
            </SectionCard>
          </div>
        </div>
      ) : null}

      {tab === "labs" ? (
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between px-6 pt-5 pb-3">
            <h2 className="card-title">Laboratory results</h2>
            <Pill tone="info">{labs.filter((lab) => lab.tone === "info").length} outstanding</Pill>
          </div>
          <TableWrap>
            <Table>
              <THead>
                <TH className="w-[32%]">Investigation</TH>
                <TH className="w-[24%]">Result</TH>
                <TH className="w-[28%]">Reference</TH>
                <TH>Flag</TH>
              </THead>
              <TBody>
                {labs.map((lab) => (
                  <TR key={lab.name}>
                    <TD>{lab.name}</TD>
                    <TD className={lab.tone === "info" ? "text-info" : undefined}>{lab.result}</TD>
                    <TD className="text-ink-soft">{lab.reference}</TD>
                    <TD>
                      <Pill tone={lab.tone}>{lab.tone === "info" ? "Awaiting result" : "Recorded"}</Pill>
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </TableWrap>
        </Card>
      ) : null}

      {tab === "appointment" ? (
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between px-6 pt-5 pb-3">
            <h2 className="card-title">Appointments</h2>
            <ScheduleVisitButton
              patients={[{ id: patient.id, name: patient.name }]}
              clinicians={clinicians.map(({ id, name }) => ({ id, name }))}
              defaultPatientId={patient.id}
              label="New visit"
              variant="primary"
            />
          </div>
          <TableWrap>
            <Table>
              <THead>
                <TH className="w-[30%]">When</TH>
                <TH className="w-[34%]">Reason</TH>
                <TH className="w-[24%]">Clinician</TH>
                <TH>Status</TH>
              </THead>
              <TBody>
                {patientAppointments.map((appointment) => (
                  <TR key={appointment.id}>
                    <TD>{dayTime(new Date(appointment.at))}</TD>
                    <TD>{appointment.reason}</TD>
                    <TD className="text-ink-soft">{clinicianName(appointment.clinicianId)}</TD>
                    <TD>
                      <Pill tone={appointment.state === "completed" ? "success" : appointment.state === "missed" ? "danger" : "brand"}>
                        {appointment.state}
                      </Pill>
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </TableWrap>
          {patientAppointments.length === 0 ? (
            <p className="px-6 py-8 text-[13px] text-ink-soft">No visits booked yet.</p>
          ) : null}
        </Card>
      ) : null}

      {tab === "care-plan" ? (
        <div className="grid items-start gap-5 xl:grid-cols-[1.3fr_1fr]">
          <SectionCard title="Care plan" bodyClassName="px-6 pt-4 pb-5">
            <CarePlanForm patientId={patient.id} plan={patient.carePlan} />
          </SectionCard>
          <SectionCard title="Screening summary" bodyClassName="flex flex-col gap-4 px-6 pt-4 pb-5">
            <StatusBadge status={screening.severity} />
            <p className="text-[14px] leading-[20px] text-ink">{screening.headline}</p>
            <div className="rounded-[8px] bg-surface-muted px-4 py-3 text-[12px] leading-[18px] text-ink-soft">
              {protocol.rules.map((rule) => (
                <p key={rule}>· {rule}</p>
              ))}
            </div>
          </SectionCard>
        </div>
      ) : null}

      {tab === "notes" ? (
        <div className="grid items-start gap-5 xl:grid-cols-[1.3fr_1fr]">
          <SectionCard title="Clinical notes" bodyClassName="flex flex-col gap-5 px-6 pt-4 pb-5">
            <NoteForm patientId={patient.id} />
            <div className="flex flex-col gap-4">
              {patient.notes.length === 0 ? (
                <p className="text-[13px] text-ink-soft">No notes recorded yet.</p>
              ) : (
                patient.notes.map((note) => (
                  <div key={note.id} className="rounded-[10px] border border-line-soft px-4 py-3">
                    <div className="flex items-center justify-between gap-3 text-[12px] text-muted">
                      <span className="font-medium text-ink-soft">{note.author}</span>
                      <span>
                        {relativeDay(new Date(note.at))} · {clock(new Date(note.at))}
                      </span>
                    </div>
                    <p className="mt-2 text-[14px] leading-[20px] text-ink">{note.body}</p>
                  </div>
                ))
              )}
            </div>
          </SectionCard>
          <SectionCard title="Why this patient is flagged" bodyClassName="flex flex-col gap-3 px-6 pt-4 pb-5">
            <StatusBadge status={screening.severity} />
            {screening.reasons.map((reason) => (
              <p key={reason} className="text-[13px] leading-[19px] text-ink-soft">
                · {reason}
              </p>
            ))}
          </SectionCard>
        </div>
      ) : null}

      {tab === "referral" ? (
        <div className="flex flex-col gap-5">
          <div className="flex justify-end">
            <SendReferralButton patients={[{ id: patient.id, name: patient.name }]} defaultPatientId={patient.id} />
          </div>
          <Card className="overflow-hidden">
            <TableWrap>
              <Table>
                <THead>
                  <TH className="w-[34%]">Destination</TH>
                  <TH className="w-[34%]">Reason</TH>
                  <TH className="w-[18%]">Sent</TH>
                  <TH>Status</TH>
                </THead>
                <TBody>
                  {patientReferrals.map((referral) => (
                    <TR key={referral.id}>
                      <TD>{referral.destination}</TD>
                      <TD className="text-ink-soft">{referral.reason}</TD>
                      <TD>{relativeDay(new Date(referral.at))}</TD>
                      <TD>
                        <Pill tone={referral.state === "accepted" ? "success" : referral.state === "closed" ? "neutral" : "warn"}>
                          {referral.state.replace("-", " ")}
                        </Pill>
                      </TD>
                    </TR>
                  ))}
                </TBody>
              </Table>
            </TableWrap>
            {patientReferrals.length === 0 ? (
              <p className="px-6 py-8 text-[13px] text-ink-soft">No referrals for this patient.</p>
            ) : null}
          </Card>
        </div>
      ) : null}

      {tab === "activity" ? (
        <Card className="px-6 py-5">
          <h2 className="card-title">Activity</h2>
          <div className="mt-5 flex flex-col gap-4">
            {patientActivity.length === 0 ? (
              <p className="text-[13px] text-ink-soft">No recorded activity yet.</p>
            ) : (
              patientActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 border-b border-line-soft pb-3 last:border-0">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-brand-accent" />
                  <div className="flex flex-col">
                    <p className="text-[14px] leading-[19px] text-ink">{activity.action}</p>
                    <p className="text-[12px] text-muted">
                      {activity.actor} · {relativeDay(new Date(activity.at))} · {clock(new Date(activity.at))}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      ) : null}

      <Card className="flex flex-wrap items-center justify-between gap-4 px-6 py-4">
        <div className="flex items-center gap-3 text-[13px] text-ink-soft">
          <FileText size={16} />
          Every reading, note and referral on this record is written to the audit trail.
        </div>
        <ButtonLink href="/alerts" variant="ghost" size="sm" className="text-brand">
          <Plus size={14} /> Open alerts
        </ButtonLink>
      </Card>
    </div>
  );
}

export const instant = false;
