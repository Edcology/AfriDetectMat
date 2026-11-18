import Link from "next/link";
import { connection } from "next/server";
import { Mail } from "lucide-react";
import { SecurityCard } from "@/components/profile/security-card";
import { Avatar } from "@/components/ui/avatar";
import { Pill } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/card";
import { auth } from "@/lib/auth/server";
import { currentUser, clinicians, facility, staff } from "@/lib/data";

export const instant = false;
export const metadata = { title: "Your profile" };

export default async function ProfilePage() {
  await connection();
  const { data } = await auth.getSession();
  const record = staff.find((member) => member.id === currentUser.id);

  const session = {
    createdAt: data?.session?.createdAt ? String(data.session.createdAt) : undefined,
    expiresAt: data?.session?.expiresAt ? String(data.session.expiresAt) : undefined,
    userAgent: data?.session?.userAgent ?? null,
  };

  return (
    <div className="flex flex-col gap-6 pt-2">
      <PageHeader title="Your profile" subtitle="Account, role and access for this facility" />

      <div className="grid items-start gap-5 xl:grid-cols-[1.1fr_1fr]">
        <div className="rounded-card border border-line bg-white">
          <div className="flex items-center gap-4 border-b border-line-soft px-6 py-5">
            <Avatar name={currentUser.name} size={56} />
            <div>
              <p className="text-[20px] leading-[25px] font-semibold text-ink">{currentUser.name}</p>
              <p className="text-[13px] text-ink-soft">
                {currentUser.role} · {facility.name}
              </p>
            </div>
          </div>
          <dl className="flex flex-col divide-y divide-line-soft">
            {[
              ["Email", data?.user?.email ?? record?.email ?? "—"],
              ["Role", currentUser.role],
              ["Facility", facility.name],
              ["Patients under your care", String(record?.patients ?? 0)],
              ["Account status", "Active"],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between gap-4 px-6 py-4 text-[14px]">
                <dt className="text-ink-soft">{label}</dt>
                <dd className="font-medium text-ink">{value}</dd>
              </div>
            ))}
          </dl>
          <p className="border-t border-line-soft px-6 py-4 text-[12px] text-muted">
            Your details are managed by the facility administrator.
          </p>
        </div>

        <div className="flex flex-col gap-5">
          <SecurityCard session={session} />

          <div className="rounded-card border border-line bg-white px-6 py-5">
            <h2 className="card-title">Clinical team</h2>
            <div className="mt-4 flex flex-col gap-3">
              {clinicians.map((clinician) => (
                <Link
                  key={clinician.id}
                  href="/facility-admin?tab=staff"
                  className="flex items-center gap-3 rounded-[8px] px-1 py-1 hover:bg-surface-muted"
                >
                  <Avatar name={clinician.name} size={28} tone="soft" />
                  <div className="flex-1">
                    <p className="text-[14px] font-medium text-ink">{clinician.name}</p>
                    <p className="text-[12px] text-muted">{clinician.role}</p>
                  </div>
                  {clinician.id === currentUser.id ? <Pill tone="brand">You</Pill> : null}
                </Link>
              ))}
            </div>
          </div>

          <div className="rounded-card border border-line bg-white px-6 py-5">
            <div className="flex items-center gap-3">
              <Mail size={16} className="text-ink-soft" />
              <p className="text-[13px] text-ink-soft">
                Need a change to your record? Ask the facility administrator.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
