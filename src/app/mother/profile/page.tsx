import Link from "next/link";
import { HeartPulse, ShieldCheck, UserRound } from "lucide-react";
import { ProfileForm } from "@/components/mother/profile-form";
import { MotherHeader } from "@/components/mother/ui";
import { clinicianName } from "@/lib/data";
import { gestationalAge } from "@/lib/format";
import { MOTHER_SLUG } from "@/lib/mother-data";
import { getDb } from "@/lib/store";

export const instant = false;
export const metadata = { title: "My profile" };

export default async function MotherProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ setup?: string }>;
}) {
  const { setup } = await searchParams;
  const db = await getDb();
  const patient = db.patients.find((entry) => entry.slug === MOTHER_SLUG) ?? db.patients[0];
  const profile = db.motherProfile;
  const isSetup = setup === "1" || !profile.setupComplete;

  return (
    <div className="flex flex-col gap-6">
      <MotherHeader
        title={isSetup ? "Set up your profile" : "My profile"}
        subtitle={
          isSetup
            ? "Connect your facility record so your care team recognises you."
            : "Your details, your record and what your care team can see."
        }
      />

      <div className="grid items-start gap-6 xl:grid-cols-[1.25fr_1fr]">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-[12px] bg-brand-mist text-brand-deep">
              <UserRound size={18} />
            </span>
            <p className="text-[14px] font-medium text-ink">Your details</p>
          </div>
          <ProfileForm profile={profile} />
        </div>

        <div className="flex flex-col gap-6">
          <div className="rounded-[16px] border border-line bg-white px-6 py-5">
            <h2 className="card-title">Your pregnancy record</h2>
            <dl className="mt-4 flex flex-col gap-3 text-[13px]">
              {[
                ["Record number", patient.id],
                ["Weeks pregnant", gestationalAge(patient.weeks, patient.days)],
                ["Estimated due date", patient.edd],
                ["Clinician", clinicianName(patient.clinicianId)],
                ["Blood group", `${patient.bloodGroup} · ${patient.genotype}`],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between gap-3 border-b border-line-soft pb-2 last:border-0 last:pb-0">
                  <dt className="text-muted">{label}</dt>
                  <dd className="text-right font-medium text-ink">{value}</dd>
                </div>
              ))}
            </dl>
            <Link
              href="/mother/records"
              className="mt-4 inline-flex h-[33px] items-center rounded-[8px] border border-line px-4 text-[12px] text-ink-soft hover:text-ink"
            >
              Open health records
            </Link>
          </div>

          <div className="rounded-[16px] border border-line bg-white px-6 py-5">
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-brand-deep" />
              <h2 className="card-title">Who can see this</h2>
            </div>
            <p className="mt-2 text-[13px] leading-[19px] text-ink-soft">
              Your care team at Harbour Health Centre can see your record. Sharing with another facility always asks you
              first — you can review and revoke access from Mother access in the clinic workspace.
            </p>
            <p className="mt-3 text-[12px] text-muted">
              Consent on record: {profile.consentShare ? "shared with care team" : "not shared"}
            </p>
          </div>

          <div className="rounded-[16px] border border-line bg-brand-mist px-6 py-5">
            <div className="flex items-center gap-2">
              <HeartPulse size={16} className="text-brand-deep" />
              <p className="text-[14px] font-medium text-brand-deep">Feeling unwell?</p>
            </div>
            <p className="mt-1 text-[12px] leading-[18px] text-brand-deep/80">
              This app is not an emergency service. If you are seriously unwell, seek medical care now.
            </p>
            <Link
              href="/mother/learn/when-you-get-urgent-help"
              className="mt-2 inline-block text-[12px] font-semibold text-brand-deep hover:underline"
            >
              What counts as urgent?
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
