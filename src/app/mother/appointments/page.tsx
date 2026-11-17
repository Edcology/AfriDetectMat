import Link from "next/link";
import { CalendarDays, MapPin, PlayCircle, UserRound } from "lucide-react";
import { MotherHeader } from "@/components/mother/ui";
import { clinicianName } from "@/lib/data";
import { clock, dayTime, relativeDay, TODAY } from "@/lib/format";
import { MOTHER_SLUG } from "@/lib/mother-data";
import { getDb } from "@/lib/store";

export const instant = false;
export const metadata = { title: "Appointments" };

export default async function MotherAppointmentsPage() {
  const db = await getDb();
  const patient = db.patients.find((entry) => entry.slug === MOTHER_SLUG) ?? db.patients[0];
  const mine = db.appointments.filter((appointment) => appointment.patientId === patient.id);
  const upcoming = mine
    .filter((appointment) => new Date(appointment.at) >= TODAY && appointment.state !== "missed")
    .sort((a, b) => a.at.localeCompare(b.at));
  const past = mine
    .filter((appointment) => new Date(appointment.at) < TODAY || appointment.state === "missed")
    .sort((a, b) => b.at.localeCompare(a.at));

  return (
    <div className="flex flex-col gap-6">
      <MotherHeader title="Appointments" subtitle="Your antenatal visits and what to expect" />

      <div className="rounded-[16px] border border-line bg-white px-6 py-5">
        <h2 className="card-title">Coming up</h2>
        {upcoming.length === 0 ? (
          <p className="mt-3 text-[13px] text-ink-soft">
            No visits booked.{" "}
            <Link href="/mother/messages" className="font-medium text-brand hover:underline">
              Message your care team
            </Link>{" "}
            to arrange one.
          </p>
        ) : (
          <div className="mt-4 flex flex-col gap-4">
            {upcoming.map((appointment) => {
              const date = new Date(appointment.at);
              return (
                <div key={appointment.id} className="flex flex-wrap items-center justify-between gap-4 border-b border-line-soft pb-4 last:border-0 last:pb-0">
                  <div className="flex items-start gap-4">
                    <div className="flex w-12 shrink-0 flex-col items-center rounded-[10px] bg-[#f1f5f2] px-2 py-2">
                      <span className="text-[18px] leading-[22px] font-semibold text-ink">{date.getDate()}</span>
                      <span className="text-[11px] text-ink-soft">
                        {date.toLocaleDateString("en-GB", { month: "short" })}
                      </span>
                    </div>
                    <div>
                      <p className="text-[15px] font-medium text-ink">{dayTime(date)}</p>
                      <p className="text-[13px] text-ink-soft">{appointment.reason}</p>
                      <p className="mt-1 flex items-center gap-3 text-[12px] text-muted">
                        <span className="inline-flex items-center gap-1">
                          <MapPin size={12} /> {appointment.location}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <UserRound size={12} /> {clinicianName(appointment.clinicianId)}
                        </span>
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href="/mother/messages"
                      className="inline-flex h-[33px] items-center rounded-[8px] border border-line px-4 text-[12px] text-ink-soft hover:text-ink"
                    >
                      Ask to reschedule
                    </Link>
                    <button
                      type="button"
                      className="inline-flex h-[33px] items-center gap-2 rounded-[8px] border border-line px-4 text-[12px] text-ink-soft hover:text-ink"
                    >
                      <PlayCircle size={13} /> Listen
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="rounded-[16px] border border-line bg-white px-6 py-5">
        <h2 className="card-title">What happens at a visit</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {[
            { title: "Checks", body: "Blood pressure, weight, urine and your baby's heartbeat." },
            { title: "Questions", body: "Bring anything you want to ask — nothing is too small." },
            { title: "Plan", body: "Your care team updates your plan and books the next visit." },
          ].map((card) => (
            <div key={card.title} className="rounded-[12px] bg-[#f1f5f2] px-4 py-3">
              <p className="text-[13px] font-medium text-ink">{card.title}</p>
              <p className="mt-1 text-[12px] leading-[18px] text-ink-soft">{card.body}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-[16px] border border-line bg-white">
        <div className="flex items-center gap-2 px-6 pt-5 pb-2">
          <CalendarDays size={16} className="text-ink-soft" />
          <h2 className="card-title">Past visits</h2>
        </div>
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-line-soft text-ink [&>th]:px-6 [&>th]:py-3 [&>th]:text-[14px] [&>th]:font-medium">
              <th className="w-[24%]">Date</th>
              <th className="w-[34%]">Reason</th>
              <th className="w-[24%]">Clinician</th>
              <th>Outcome</th>
            </tr>
          </thead>
          <tbody>
            {past.map((appointment) => (
              <tr key={appointment.id} className="border-b border-line-soft last:border-0">
                <td className="px-6 py-4 text-[14px] text-ink">{dayTime(new Date(appointment.at))}</td>
                <td className="px-6 py-4 text-[14px] text-ink-soft">{appointment.reason}</td>
                <td className="px-6 py-4 text-[14px] text-ink-soft">{clinicianName(appointment.clinicianId)}</td>
                <td className="px-6 py-4 text-[14px] text-ink">
                  {appointment.state === "missed" ? "Missed" : "Attended"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {past.length === 0 ? <p className="px-6 py-6 text-[13px] text-ink-soft">No past visits yet.</p> : null}
      </div>

      <p className="text-[11px] text-muted">
        Last check-in {relativeDay(new Date(patient.lastCheckIn))} at {clock(new Date(patient.lastCheckIn))}.
      </p>
    </div>
  );
}
