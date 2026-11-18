import Link from "next/link";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { ScheduleVisitButton } from "@/components/forms/schedule-visit-dialog";
import { Pill } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/card";
import { Table, TBody, TD, TH, THead, TR, TableWrap } from "@/components/ui/table";
import { UnderlineTabs } from "@/components/ui/tabs";
import { clinicians, clinicianName } from "@/lib/data";
import { clock, dayTime, isSameDay, monthTitle, relativeDay, TODAY } from "@/lib/format";
import { getDb } from "@/lib/store";
import type { Appointment } from "@/lib/types";

export const metadata = { title: "Appointments" };

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function monthMatrix(year: number, month: number) {
  const first = new Date(year, month, 1);
  const start = new Date(year, month, 1 - first.getDay());
  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(start.getFullYear(), start.getMonth(), start.getDate() + index);
    return { date, inMonth: date.getMonth() === month };
  });
}

const stateTone = {
  completed: "bg-success-soft text-success",
  upcoming: "bg-brand-tint text-brand-deep",
  missed: "bg-warn-soft text-warn",
} as const;

export default async function AppointmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string; day?: string; month?: string }>;
}) {
  const params = await searchParams;
  const view = params.view ?? "calendar";
  const db = await getDb();

  const [year, month] = (params.month ?? "").split("-").map(Number);
  const validMonth = Number.isFinite(year) && Number.isFinite(month) && month >= 1 && month <= 12;
  const monthDate = validMonth ? new Date(year, month - 1, 1) : TODAY;
  const shiftMonth = (delta: number) => {
    const next = new Date(monthDate.getFullYear(), monthDate.getMonth() + delta, 1);
    return `/appointments?month=${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, "0")}`;
  };
  const cells = monthMatrix(monthDate.getFullYear(), monthDate.getMonth());

  const viewingThisMonth =
    monthDate.getFullYear() === TODAY.getFullYear() && monthDate.getMonth() === TODAY.getMonth();
  const selectedDay = params.day ? Number(params.day) : viewingThisMonth ? TODAY.getDate() : -1;
  const selectedDate = new Date(monthDate.getFullYear(), monthDate.getMonth(), selectedDay);
  const dayAppointments = db.appointments
    .filter((appointment) => isSameDay(new Date(appointment.at), selectedDate))
    .sort((a, b) => a.at.localeCompare(b.at));

  const byDay = (date: Date) =>
    db.appointments.filter((appointment) => isSameDay(new Date(appointment.at), date));

  const lists: Record<string, Appointment[]> = {
    upcoming: db.appointments.filter((a) => a.state === "upcoming").sort((a, b) => a.at.localeCompare(b.at)),
    passed: db.appointments.filter((a) => a.state === "completed").sort((a, b) => b.at.localeCompare(a.at)),
    missed: db.appointments.filter((a) => a.state === "missed").sort((a, b) => b.at.localeCompare(a.at)),
  };
  const rows = lists[view] ?? [];

  return (
    <div className="flex flex-col gap-6 pt-2">
      <PageHeader
        title="Appointments"
        subtitle={`Week of 16–22 ${monthTitle(monthDate)}`}
        actions={
          <ScheduleVisitButton
            patients={db.patients.map(({ id, name }) => ({ id, name }))}
            clinicians={clinicians.map(({ id, name }) => ({ id, name }))}
            label="Schedule appointment"
            variant="primary"
          />
        }
      />

      <UnderlineTabs
        active={view === "calendar" ? "Calendar" : view === "passed" ? "Passed" : view === "missed" ? "Missed" : "Upcoming"}
        items={[
          { href: "/appointments", label: "Calendar" },
          { href: "/appointments?view=upcoming", label: "Upcoming", count: lists.upcoming.length },
          { href: "/appointments?view=passed", label: "Passed" },
          { href: "/appointments?view=missed", label: "Missed", count: lists.missed.length },
        ]}
      />

      {view === "calendar" ? (
        <div className="grid items-start gap-5 xl:grid-cols-[390px_1fr]">
          <div className="flex flex-col gap-5">
            <div className="rounded-card border border-line bg-white px-6 py-5">
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-medium text-ink">{monthTitle(monthDate)}</span>
                <div className="flex items-center gap-1 text-ink-soft">
                  <Link
                    href={shiftMonth(-1)}
                    aria-label="Previous month"
                    className="grid size-6 place-items-center rounded-[6px] hover:bg-surface-muted"
                  >
                    <ChevronLeft size={14} />
                  </Link>
                  <Link
                    href={shiftMonth(1)}
                    aria-label="Next month"
                    className="grid size-6 place-items-center rounded-[6px] hover:bg-surface-muted"
                  >
                    <ChevronRight size={14} />
                  </Link>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-7 gap-y-2 text-center">
                {WEEKDAYS.map((day) => (
                  <span key={day} className="text-[11px] font-medium text-muted">
                    {day[0]}
                  </span>
                ))}
                {cells.slice(0, 35).map(({ date, inMonth }) => {
                  const dayItems = byDay(date);
                  const isToday = isSameDay(date, TODAY);
                  const isSelected = date.getDate() === selectedDay && inMonth;
                  return (
                    <Link
                      key={date.toISOString()}
                      href={`/appointments?day=${date.getDate()}`}
                      className="relative flex h-9 flex-col items-center justify-center"
                    >
                      <span
                        className={`grid size-7 place-items-center rounded-[6px] text-[13px] ${
                          isSelected
                            ? "bg-brand font-medium text-white"
                            : isToday
                              ? "font-semibold text-brand-deep"
                              : inMonth
                                ? "text-ink"
                                : "text-line"
                        }`}
                      >
                        {date.getDate()}
                      </span>
                      {dayItems.length > 0 ? (
                        <span className="mt-0.5 flex gap-0.5">
                          {dayItems.slice(0, 3).map((item) => (
                            <span
                              key={item.id}
                              className={`size-1 rounded-full ${
                                item.state === "missed" ? "bg-warn" : item.state === "completed" ? "bg-success" : "bg-brand-accent"
                              }`}
                            />
                          ))}
                        </span>
                      ) : null}
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="rounded-card border border-line bg-white px-6 py-5">
              <p className="text-[16px] leading-[20px] font-medium text-ink">
                {selectedDate.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })}
              </p>
              {dayAppointments.length === 0 ? (
                <>
                  <p className="mt-3 text-[14px] text-ink-soft">Nothing scheduled</p>
                  <p className="mt-1 text-[13px] text-muted">No visits on this day</p>
                </>
              ) : (
                <ul className="mt-3 flex flex-col gap-3">
                  {dayAppointments.map((appointment) => (
                    <li key={appointment.id} className="flex items-center justify-between gap-3 text-[13px]">
                      <span className="min-w-0">
                        <span className="block truncate font-medium text-ink">{appointment.patientName}</span>
                        <span className="block truncate text-muted">{appointment.reason}</span>
                      </span>
                      <span className="shrink-0 text-ink-soft">{clock(new Date(appointment.at))}</span>
                    </li>
                  ))}
                </ul>
              )}
              <div className="mt-4">
                <ScheduleVisitButton
                  patients={db.patients.map(({ id, name }) => ({ id, name }))}
                  clinicians={clinicians.map(({ id, name }) => ({ id, name }))}
                  label="Schedule appointment"
                  variant="primary"
                />
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-card border border-line bg-white">
            <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4">
              <div className="flex items-center gap-3">
                <span className="text-[16px] font-medium text-ink">{monthTitle(monthDate)}</span>
                <span className="ml-1 inline-flex items-center gap-1 text-ink-soft">
                  <Link
                    href={shiftMonth(-1)}
                    aria-label="Previous month"
                    className="grid size-7 place-items-center rounded-[6px] border border-line-soft"
                  >
                    <ChevronLeft size={14} />
                  </Link>
                  <Link
                    href={shiftMonth(1)}
                    aria-label="Next month"
                    className="grid size-7 place-items-center rounded-[6px] border border-line-soft"
                  >
                    <ChevronRight size={14} />
                  </Link>
                </span>
                <Link
                  href="/appointments"
                  className="ml-1 inline-flex h-8 items-center rounded-[8px] border border-line-soft px-3 text-[12px] text-ink-soft hover:text-ink"
                >
                  Today
                </Link>
              </div>
              <div className="flex items-center gap-4 text-[12px] text-ink-soft">
                <span className="inline-flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-success" /> Completed
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-brand-accent" /> Upcoming
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-warn" /> Missed
                </span>
              </div>
            </div>

            <div className="grid grid-cols-7 border-t border-line-soft bg-surface-muted/60">
              {WEEKDAYS.map((day) => (
                <div key={day} className="border-r border-line-soft px-3 py-2 text-[12px] font-medium text-ink-soft last:border-r-0">
                  {day.toUpperCase()}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7">
              {cells.map(({ date, inMonth }) => {
                const dayItems = byDay(date);
                const isToday = isSameDay(date, TODAY);
                return (
                  <div
                    key={date.toISOString()}
                    className={`min-h-[104px] border-r border-b border-line-soft p-2 last:border-r-0 ${
                      inMonth ? "bg-white" : "bg-[#fbfcfb]"
                    }`}
                  >
                    <span
                      className={`text-[13px] ${
                        isToday
                          ? "inline-grid size-6 place-items-center rounded-full bg-brand text-white"
                          : inMonth
                            ? "text-ink"
                            : "text-line"
                      }`}
                    >
                      {date.getDate()}
                    </span>
                    <div className="mt-1 flex flex-col gap-1">
                      {dayItems.slice(0, 3).map((appointment) => (
                        <Link
                          key={appointment.id}
                          href={`/appointments?day=${date.getDate()}`}
                          className={`truncate rounded-[4px] px-1.5 py-0.5 text-[11px] leading-[14px] ${stateTone[appointment.state]}`}
                        >
                          {appointment.patientName}
                        </Link>
                      ))}
                      {dayItems.length > 3 ? (
                        <span className="px-1.5 text-[10px] text-muted">+{dayItems.length - 3} more</span>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="overflow-hidden rounded-card border border-line bg-white">
          <TableWrap>
            <Table>
              <THead>
                <TH className="w-[26%]">Patient</TH>
                <TH className="w-[30%]">Reason</TH>
                <TH className="w-[22%]">When</TH>
                <TH className="w-[18%]">Clinician</TH>
                <TH>Status</TH>
              </THead>
              <TBody>
                {rows.map((appointment) => (
                  <TR key={appointment.id}>
                    <TD>{appointment.patientName}</TD>
                    <TD className="text-ink-soft">{appointment.reason}</TD>
                    <TD>{dayTime(new Date(appointment.at))}</TD>
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
          {rows.length === 0 ? <p className="px-6 py-10 text-center text-[13px] text-ink-soft">Nothing here yet.</p> : null}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 text-[12px] text-muted">
        <span>
          {db.appointments.filter((a) => a.state === "upcoming").length} upcoming ·{" "}
          {db.appointments.filter((a) => a.state === "missed").length} missed ·{" "}
          {db.appointments.filter((a) => a.state === "completed").length} completed
        </span>
        <ButtonLink href="/patients" variant="ghost" size="sm" className="text-brand">
          <Plus size={14} /> Book from a patient record
        </ButtonLink>
      </div>
    </div>
  );
}

export const instant = false;
