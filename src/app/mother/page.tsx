import Link from "next/link";
import { ArrowRight, ArrowUpRight, HeartHandshake, UserRound } from "lucide-react";
import { SpeakButton } from "@/components/mother/actions-ui";
import { MotherHeader } from "@/components/mother/ui";
import { clinicians, clinicianName } from "@/lib/data";
import { clock, dayTime, greeting, relativeDay, stamp } from "@/lib/format";
import { MOTHER_SLUG } from "@/lib/mother-data";
import { getDb } from "@/lib/store";

export const instant = false;

function ProgressRing({ weeks, edd }: { weeks: number; edd: string }) {
  const radius = 84;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(1, Math.max(0, weeks / 40));
  return (
    <div className="flex w-[200px] shrink-0 flex-col items-center gap-3">
      <div className="relative size-[192px]">
        <svg viewBox="0 0 200 200" className="size-full -rotate-90">
          <circle cx="100" cy="100" r={radius} fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="14" />
          <circle
            cx="100"
            cy="100"
            r={radius}
            fill="none"
            stroke="#D9ECE3"
            strokeWidth="14"
            strokeLinecap="round"
            strokeDasharray={`${circumference * progress} ${circumference}`}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
          <span className="text-[32px] leading-[38px] font-semibold">{weeks}</span>
          <span className="text-[14px] leading-[18px] text-white/75">Weeks</span>
        </div>
      </div>
      <p className="text-center text-[11px] leading-[14px] font-semibold text-white">
        Estimated due date: {edd}
      </p>
    </div>
  );
}

export default async function MotherHomePage() {
  const db = await getDb();
  const patient = db.patients.find((entry) => entry.slug === MOTHER_SLUG) ?? db.patients[0];
  const latest = patient.readings.at(-1);
  const previous = patient.readings.at(-2);
  const nextVisit = db.appointments
    .filter((appointment) => appointment.patientId === patient.id && appointment.state === "upcoming")
    .sort((a, b) => a.at.localeCompare(b.at))[0];
  const careMessages = db.messages.filter((message) => message.from === "care");
  const lastCareMessage = careMessages.at(-1);
  const unread = db.threads.reduce((total, thread) => total + thread.unread, 0);
  const checkIns = db.checkIns;
  const setupDone = db.motherProfile.setupComplete;

  const first = db.motherProfile.name.split(" ")[0];

  return (
    <div className="flex flex-col gap-8">
      <MotherHeader
        title={`${greeting()}, ${first}`}
        subtitle="Keep up with your care, one step at a time."
      />

      {setupDone ? null : (
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-[16px] border border-line bg-[#f1f5f2] px-6 py-3">
          <div className="flex items-center gap-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-[12px] bg-[#e6f0e8] text-brand-deep">
              <UserRound size={18} strokeWidth={1.7} />
            </span>
            <div>
              <p className="text-[14px] leading-[18px] font-semibold text-ink">Let&apos;s set up your account</p>
              <p className="text-[12px] leading-[16px] text-ink-soft">
                Connect your facility record to see your pregnancy information, appointments and updates from your care team.
              </p>
            </div>
          </div>
          <Link
            href="/mother/profile?setup=1"
            className="inline-flex h-[42px] items-center rounded-[8px] bg-brand px-4 text-[14px] font-medium text-white hover:bg-[#093f3b]"
          >
            Set up profile
          </Link>
        </div>
      )}

      <section className="relative overflow-hidden rounded-[16px] bg-brand px-8 py-8 text-white">
        <span className="pointer-events-none absolute -right-24 -top-32 size-72 rounded-full bg-[#266f6a]" />
        <span className="pointer-events-none absolute -right-40 bottom-0 size-72 rounded-full bg-[#266f6a] opacity-70" />
        <div className="relative flex flex-wrap items-center justify-between gap-8">
          <div className="max-w-[614px]">
            <h2 className="text-[34px] leading-[42px] font-semibold tracking-[-0.34px]">
              Your due date is approaching!
            </h2>
            <p className="mt-3 text-[16px] leading-[22px] text-white/80">
              Your baby is growing, and each passing day brings you closer to delivery. Here&apos;s a look at how much
              time remains until your estimated due date.
            </p>
            <Link
              href={setupDone ? "/mother/records" : "/mother/profile?setup=1"}
              className="mt-8 inline-flex h-[42px] items-center gap-2 rounded-[8px] bg-white px-4 text-[14px] font-medium text-brand hover:bg-[#f2f8f5]"
            >
              {setupDone ? "View my health records" : "Connect my care record"}
              <ArrowRight size={15} />
            </Link>
          </div>
          <ProgressRing weeks={patient.weeks} edd={patient.edd} />
        </div>
      </section>

      <div className="grid items-start gap-6 xl:grid-cols-[625px_1fr]">
        <div className="flex min-w-0 flex-col gap-6">
          <div className="rounded-[16px] border border-line bg-white px-6 py-5">
            <div className="flex items-start gap-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-[12px] bg-[#e6f0e8] text-brand-deep">
                <HeartHandshake size={18} strokeWidth={1.7} />
              </span>
              <div>
                <p className="text-[16px] leading-[20px] font-medium text-ink">How are you feeling today?</p>
                <p className="mt-1 text-[13px] leading-[18px] text-ink-soft">
                  A quick check-in helps you share how you&apos;re doing with your care team.
                </p>
              </div>
            </div>
            <div className="mt-5 flex flex-wrap items-center gap-3 pl-12">
              <Link
                href="/mother/check-in"
                className="inline-flex h-[42px] items-center gap-2 rounded-[8px] bg-brand px-4 text-[14px] font-medium text-white hover:bg-[#093f3b]"
              >
                {db.checkIns.some((entry) => relativeDay(new Date(entry.at)) === "Today")
                  ? "Update today's check-in"
                  : "Start daily check-in"}
                <ArrowRight size={15} />
              </Link>
              <span className="text-[12px] text-muted">
                {checkIns.length} check-in{checkIns.length === 1 ? "" : "s"} so far
              </span>
            </div>
          </div>

          <div className="rounded-[16px] border border-line bg-white px-6 py-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="card-title">Your latest readings</h2>
              <Link href="/mother/records?tab=reading" className="text-[12px] font-medium text-brand hover:underline">
                See all
              </Link>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <div className="rounded-[12px] bg-[#f1f5f2] px-4 py-3">
                <p className="text-[12px] leading-[15px] text-ink-soft">Blood pressure</p>
                <p className="mt-2 text-[24px] leading-[30px] font-semibold text-ink">
                  {latest ? `${latest.systolic}/${latest.diastolic}` : "—"}
                </p>
                <p className="text-[11px] text-muted">mmHg</p>
              </div>
              <div className="rounded-[12px] bg-[#f1f5f2] px-4 py-3">
                <p className="text-[12px] leading-[15px] text-ink-soft">Weight</p>
                <p className="mt-2 text-[24px] leading-[30px] font-semibold text-ink">66</p>
                <p className="text-[11px] text-muted">Kg</p>
              </div>
              <div className="rounded-[12px] bg-[#f1f5f2] px-4 py-3">
                <p className="text-[12px] leading-[15px] text-ink-soft">Last check-in</p>
                <p className="mt-2 text-[24px] leading-[30px] font-semibold text-ink">
                  {checkIns[0] ? relativeDay(new Date(checkIns[0].at)) : "None"}
                </p>
                <p className="text-[11px] text-muted">{checkIns[0] ? clock(new Date(checkIns[0].at)) : "—"}</p>
              </div>
            </div>
            <p className="mt-4 text-[13px] leading-[19px] text-ink">
              Your latest blood pressure is close to your usual.
              <span className="block text-[12px] leading-[17px] text-ink-soft">
                Your last 5 readings were between{" "}
                {Math.min(...patient.readings.map((reading) => reading.systolic))} and{" "}
                {Math.max(...patient.readings.map((reading) => reading.systolic))}. Your care team reviews each one.
              </span>
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                href="/mother/records?tab=reading"
                className="inline-flex h-[33px] items-center rounded-[8px] border border-line px-4 text-[12px] text-ink-soft hover:text-ink"
              >
                See all your readings
              </Link>
              <SpeakButton
                text={`Your latest blood pressure is ${
                  latest ? `${latest.systolic} over ${latest.diastolic}` : "not recorded yet"
                }. Your last readings were between ${Math.min(
                  ...patient.readings.map((reading) => reading.systolic)
                )} and ${Math.max(
                  ...patient.readings.map((reading) => reading.systolic)
                )}. Your care team reviews each one.`}
              />
            </div>
          </div>
        </div>

        <div className="flex min-w-0 flex-col gap-6">
          <div className="rounded-[16px] border border-line bg-white px-6 py-5">
            <p className="text-[11px] leading-[14px] font-semibold tracking-[0.66px] text-brand-deep uppercase">
              Your next visit
            </p>
            {nextVisit ? (
              <>
                <div className="mt-3 flex items-start gap-3">
                  <div className="flex w-11 shrink-0 flex-col items-center rounded-[8px] bg-[#f1f5f2] px-2 py-1.5">
                    <span className="text-[16px] leading-[20px] font-semibold text-ink">
                      {new Date(nextVisit.at).getDate()}
                    </span>
                    <span className="text-[11px] leading-[14px] text-ink-soft">
                      {new Date(nextVisit.at).toLocaleDateString("en-GB", { month: "short" })}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[14px] leading-[18px] font-medium text-ink">{dayTime(new Date(nextVisit.at))}</p>
                    <p className="text-[12px] leading-[16px] text-ink-soft">
                      {nextVisit.reason} · Harbour Health Centre
                    </p>
                    <p className="text-[12px] text-muted">{clinicianName(nextVisit.clinicianId)}</p>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-3">
                  <Link
                    href="/mother/messages"
                    className="inline-flex h-[33px] items-center rounded-[8px] border border-line px-4 text-[12px] text-ink-soft hover:text-ink"
                  >
                    Ask to reschedule
                  </Link>
                  <SpeakButton
                    text={
                      nextVisit
                        ? `${dayTime(new Date(nextVisit.at))}, ${nextVisit.reason} at Harbour Health Centre with ${clinicianName(nextVisit.clinicianId)}.`
                        : "No visit is booked. Message your care team to arrange one."
                    }
                  />
                </div>
              </>
            ) : (
              <p className="mt-3 text-[13px] text-ink-soft">No visit booked. Message your care team to arrange one.</p>
            )}
          </div>

          <div className="rounded-[16px] border border-line bg-white px-6 py-5">
            <div className="flex items-center gap-3">
              <h2 className="card-title">Messages</h2>
              {unread > 0 ? (
                <span className="rounded-pill bg-danger-soft px-2 py-0.5 text-[11px] font-medium text-danger">
                  {unread} new
                </span>
              ) : null}
            </div>
            {lastCareMessage ? (
              <div className="mt-3 rounded-[12px] bg-[#f1f5f2] px-4 py-3">
                <p className="text-[13px] leading-[19px] text-ink">{lastCareMessage.body}</p>
                <p className="mt-1 text-[11px] text-muted">{relativeDay(new Date(lastCareMessage.at))}</p>
              </div>
            ) : (
              <p className="mt-3 text-[13px] text-ink-soft">No messages yet.</p>
            )}
            <Link
              href="/mother/messages"
              className="mt-4 inline-flex h-[33px] items-center rounded-[8px] border border-line px-4 text-[12px] text-ink-soft hover:text-ink"
            >
              Reply
            </Link>
          </div>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-3">
        {[
          {
            title: "Your care team",
            body: clinicianName(patient.clinicianId),
            href: "/mother/messages",
            cta: "Message",
          },
          {
            title: "Warning signs",
            body: "Know when to get urgent help.",
            href: "/mother/learn/when-you-get-urgent-help",
            cta: "Read",
          },
          {
            title: "Your records",
            body: `${patient.readings.length} readings · ${db.checkIns.length} check-ins`,
            href: "/mother/records",
            cta: "Open",
          },
        ].map((card) => (
          <div key={card.title} className="flex flex-col justify-between rounded-[16px] border border-line bg-white px-4 py-3">
            <div>
              <p className="text-[14px] leading-[18px] font-medium text-ink">{card.title}</p>
              <p className="mt-1 text-[12px] leading-[16px] text-ink-soft">{card.body}</p>
            </div>
            <Link
              href={card.href}
              className="mt-3 inline-flex items-center gap-1 text-[12px] font-semibold text-brand-deep hover:underline"
            >
              {card.cta} <ArrowUpRight size={12} />
            </Link>
          </div>
        ))}
      </div>

      <p className="text-[11px] leading-[16px] text-muted">
        Signed in as {db.motherProfile.name} · {patient.id} · last updated {stamp(new Date(patient.lastCheckIn))} ·{" "}
        {clinicians.length} clinicians at Harbour Health Centre can see your record.
      </p>
    </div>
  );
}
