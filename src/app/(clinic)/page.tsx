import Link from "next/link";
import { ArrowUpRight, ChevronDown, Plus } from "lucide-react";
import { AddPatientButton } from "@/components/forms/add-patient-dialog";
import { ScheduleVisitButton } from "@/components/forms/schedule-visit-dialog";
import { MiniBars } from "@/components/charts/mini-bars";
import { TrendLine } from "@/components/charts/trend-line";
import { StatusBadge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, SectionCard } from "@/components/ui/card";
import { clinicians, currentUser } from "@/lib/data";
import { clock, dayTime, gestationalAge, greeting, longDate, relativeDay, TODAY } from "@/lib/format";
import { getDb } from "@/lib/store";
import { screenForHypertension } from "@/lib/screening";

export const metadata = { title: "Overview" };

export default async function OverviewPage() {
  const db = await getDb();

  const openAlerts = db.alerts.filter((alert) => !alert.acknowledged);
  const needReview = openAlerts.filter((alert) => alert.severity !== "routine").length;
  const inProgressReferrals = db.referrals.filter((referral) => referral.state === "in-progress").length;

  const stats = [
    {
      label: "Patients under care",
      value: db.patients.length,
      note: "+1 registered this week",
      bars: [3, 5, 4, 6, 8],
      accent: "#0B4F4A",
    },
    {
      label: "Need review today",
      value: needReview,
      note: "Check-ins and alerts combined",
      bars: [4, 6, 5, 8, 6],
      accent: "#C98A2E",
    },
    {
      label: "Open alerts",
      value: openAlerts.length,
      note: `${openAlerts.length} not yet acknowledged`,
      bars: [6, 5, 7, 4, 9],
      accent: "#C74747",
    },
    {
      label: "Referrals in progress",
      value: inProgressReferrals,
      note: "Across all facilities",
      bars: [3, 4, 6, 5, 7],
      accent: "#0B4F4A",
    },
  ];

  const patientBySlug = new Map(db.patients.map((patient) => [patient.id, patient]));

  const attention = [...db.alerts]
    .sort((a, b) => {
      if (a.acknowledged !== b.acknowledged) return a.acknowledged ? 1 : -1;
      const weight = { urgent: 0, review: 1, routine: 2, "more-data": 3 } as const;
      return weight[a.severity] - weight[b.severity];
    })
    .slice(0, 3);

  const counts = {
    review: db.patients.filter((patient) => patient.status === "review").length,
    urgent: db.patients.filter((patient) => patient.status === "urgent").length,
    routine: db.patients.filter((patient) => patient.status === "routine").length,
    moreData: db.patients.filter((patient) => patient.status === "more-data").length,
  };

  const upcoming = db.appointments
    .filter((appointment) => appointment.state === "upcoming")
    .sort((a, b) => a.at.localeCompare(b.at))
    .slice(0, 3);

  const trendPatient =
    db.patients.find((patient) => patient.slug === "zainab-bello") ??
    db.patients.find((patient) => patient.readings.length > 1) ??
    db.patients[0];

  const trendPoints = (trendPatient?.readings ?? []).slice(-5).map((reading) => ({
    label: relativeDay(new Date(reading.at)),
    value: reading.systolic,
  }));

  const latest = trendPatient?.readings.at(-1);
  const screening = trendPatient ? screenForHypertension(trendPatient) : null;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-start justify-between gap-4 pt-2">
        <div className="flex flex-col gap-2">
          <h1 className="page-title">
            {greeting()}, Dr. {currentUser.name.replace(/^Dr\.\s*/, "").split(" ")[0]}
          </h1>
          <p className="page-subtitle">
            {longDate(TODAY)} · Here&apos;s your maternal care overview.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <ScheduleVisitButton
            patients={db.patients.map(({ id, name }) => ({ id, name }))}
            clinicians={clinicians.map(({ id, name }) => ({ id, name }))}
          />
          <AddPatientButton clinicians={clinicians.map(({ id, name }) => ({ id, name }))} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="flex h-[138px] flex-col justify-between px-6 py-4">
            <div className="flex items-start justify-between gap-4">
              <p className="label-xs max-w-[150px]">{stat.label}</p>
              <MiniBars values={stat.bars} accent={stat.accent} />
            </div>
            <div className="flex flex-col">
              <p className="text-[56px] leading-[52px] font-bold text-ink">{stat.value}</p>
              <p className="mt-1 truncate text-[12px] leading-[15px] font-normal text-ink-soft">{stat.note}</p>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid items-start gap-5 xl:grid-cols-[1.45fr_1fr]">
        <div className="flex min-w-0 flex-col gap-5">
          <SectionCard
            title="Needs attention"
            className="min-h-[305px]"
            bodyClassName="flex flex-col gap-4 px-6 pb-4"
          >
            <div className="flex flex-col">
              {attention.map((alert, index) => {
                const patient = patientBySlug.get(alert.patientId);
                return (
                  <div key={alert.id} className="flex flex-col">
                    {index > 0 ? <div className="mb-4 h-px bg-line-soft" /> : null}
                    <div className="flex items-start justify-between gap-6 pb-1">
                      <div className="flex min-w-0 flex-col gap-2">
                        <div className="flex flex-wrap items-center gap-3">
                          <Link
                            href={patient ? `/patients/${patient.slug}` : "/patients"}
                            className="text-[16px] leading-[20px] font-medium text-ink hover:underline"
                          >
                            {alert.patientName}
                          </Link>
                          {patient ? (
                            <span className="rounded-[4px] bg-surface-muted px-1.5 py-0.5 text-[12px] leading-[15px] text-ink-soft">
                              {patient.id} · {gestationalAge(patient.weeks, patient.days)}
                            </span>
                          ) : null}
                          <StatusBadge status={alert.severity} />
                        </div>
                        <p className="text-[16px] leading-[20px] font-normal text-ink">{alert.title}</p>
                        <p className="text-[10px] leading-[13px] font-light tracking-[-0.1px] text-ink">
                          {clock(new Date(alert.at))} ·{" "}
                          {alert.assignedTo ? `Assigned · ${alert.acknowledged ? "Acknowledged" : "Awaiting acknowledgement"}` : "Unassigned · Not yet acknowledged"}
                        </p>
                      </div>
                      <ButtonLink
                        href={patient ? `/patients/${patient.slug}` : "/patients"}
                        variant="secondary"
                        size="sm"
                        className="mt-1 shrink-0"
                      >
                        Review patient
                      </ButtonLink>
                    </div>
                  </div>
                );
              })}
            </div>
          </SectionCard>

          <SectionCard
            title="Systolic trend"
            action={
              <Link
                href={trendPatient ? `/patients/${trendPatient.slug}?tab=health-records` : "/patients"}
                className="inline-flex h-[30px] items-center gap-2 rounded-[8px] border border-line-soft px-4 text-[12px] leading-[15px] font-normal text-ink-soft hover:border-line hover:text-ink"
              >
                {trendPatient?.name ?? "No patient"}
                <ChevronDown size={16} strokeWidth={1.6} />
              </Link>
            }
            bodyClassName="px-6 pt-2 pb-4"
          >
            {trendPoints.length > 1 ? (
              <TrendLine points={trendPoints} height={140} />
            ) : (
              <p className="py-8 text-[13px] text-ink-soft">Not enough readings yet to draw a trend.</p>
            )}
            <div className="mt-2 flex flex-wrap items-center justify-between gap-3 text-[12px] leading-[15px] text-ink-soft">
              <span className="font-normal">
                mmHg · last {trendPoints.length} check-in{trendPoints.length === 1 ? "" : "s"}
              </span>
              {screening ? <span className="text-muted">{screening.headline}</span> : null}
            </div>
          </SectionCard>
        </div>

        <div className="flex min-w-0 flex-col gap-5">
          <SectionCard title="Maternal health overview" bodyClassName="flex flex-col gap-3 px-6 pb-5 pt-5">
            {[
              { label: "Review recommended", tone: "review" as const, count: counts.review, href: "/patients?status=review" },
              { label: "Urgent review", tone: "urgent" as const, count: counts.urgent, href: "/patients?status=urgent" },
              { label: "Routine monitoring", tone: "routine" as const, count: counts.routine, href: "/patients?status=routine" },
              ...(counts.moreData > 0
                ? [{ label: "More data needed", tone: "more-data" as const, count: counts.moreData, href: "/patients?status=more-data" }]
                : []),
            ].map((row, index, all) => (
              <OverviewRow key={row.label} {...row} last={index === all.length - 1} />
            ))}
          </SectionCard>

          <SectionCard title="Upcoming appointments" bodyClassName="flex flex-col gap-4 px-6 pb-4 pt-4">
            <div className="flex flex-col">
              {upcoming.map((appointment, index) => {
                const when = new Date(appointment.at);
                return (
                  <div key={appointment.id} className="flex flex-col">
                    {index > 0 ? <div className="my-4 h-px bg-line-soft" /> : null}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex min-w-0 flex-col">
                        <Link
                          href={
                            patientBySlug.get(appointment.patientId)
                              ? `/patients/${patientBySlug.get(appointment.patientId)!.slug}`
                              : "/patients"
                          }
                          className="truncate text-[16px] leading-[20px] font-medium text-ink hover:underline"
                        >
                          {appointment.patientName}
                        </Link>
                        <p className="text-[12px] leading-[15px] font-normal text-ink-soft">{appointment.reason}</p>
                      </div>
                      <p className="shrink-0 text-[12px] leading-[15px] font-normal text-ink-soft">{dayTime(when)}</p>
                    </div>
                  </div>
                );
              })}
              {upcoming.length === 0 ? (
                <p className="text-[13px] text-ink-soft">Nothing scheduled yet.</p>
              ) : null}
            </div>
            <div>
              <ButtonLink href="/appointments" variant="secondary" size="sm">
                View all
              </ButtonLink>
            </div>
          </SectionCard>

          <SectionCard title="Recent activities" bodyClassName="flex flex-col gap-3 px-6 pb-5 pt-4">
            {db.activities.slice(0, 4).map((activity) => (
              <p key={activity.id} className="text-[14px] leading-[19px] font-normal text-ink">
                {activity.action}
                {activity.subject ? <span className="text-ink-soft"> · {activity.subject}</span> : null}
              </p>
            ))}
            <ButtonLink href="/reports" variant="ghost" size="sm" className="mt-1 self-start px-0 text-brand">
              Open activity log
              <ArrowUpRight size={14} />
            </ButtonLink>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}

function OverviewRow({
  label,
  tone,
  count,
  href,
  last,
}: {
  label: string;
  tone: "review" | "urgent" | "routine" | "more-data";
  count: number;
  href: string;
  last?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between gap-4 ${last ? "" : "border-b border-line-soft pb-4"}`}
    >
      <StatusBadge status={tone} />
      <Link href={href} className="text-[16px] leading-[20px] font-medium text-ink hover:underline">
        {count}
      </Link>
    </div>
  );
}

export const instant = false;
