import { KeyRound, LogOut, Mail, ShieldCheck, Smartphone } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Pill } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/card";
import { currentUser, clinicians, facility, staff } from "@/lib/data";

export const metadata = { title: "Your profile" };

export default function ProfilePage() {
  const record = staff.find((member) => member.id === currentUser.id);

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
              ["Email", record?.email ?? "adika.nwosu@harbour.health"],
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
          <div className="rounded-card border border-line bg-white px-6 py-5">
            <h2 className="card-title">Security</h2>
            <div className="mt-4 flex flex-col gap-4">
              {[
                { icon: KeyRound, label: "Password", value: "Updated 42 days ago", action: "Change" },
                { icon: Smartphone, label: "Two-factor authentication", value: "Enabled · authenticator app", action: "Manage" },
                { icon: ShieldCheck, label: "Active sessions", value: "2 devices", action: "Review" },
              ].map((row) => {
                const Icon = row.icon;
                return (
                  <div key={row.label} className="flex items-center gap-3 border-b border-line-soft pb-3 last:border-0 last:pb-0">
                    <span className="grid size-9 place-items-center rounded-full bg-surface-muted text-ink-soft">
                      <Icon size={16} />
                    </span>
                    <div className="flex-1">
                      <p className="text-[14px] font-medium text-ink">{row.label}</p>
                      <p className="text-[12px] text-muted">{row.value}</p>
                    </div>
                    <span className="text-[12px] font-medium text-brand">{row.action}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-card border border-line bg-white px-6 py-5">
            <h2 className="card-title">Clinical team</h2>
            <div className="mt-4 flex flex-col gap-3">
              {clinicians.map((clinician) => (
                <div key={clinician.id} className="flex items-center gap-3">
                  <Avatar name={clinician.name} size={28} tone="soft" />
                  <div className="flex-1">
                    <p className="text-[14px] font-medium text-ink">{clinician.name}</p>
                    <p className="text-[12px] text-muted">{clinician.role}</p>
                  </div>
                  {clinician.id === currentUser.id ? <Pill tone="brand">You</Pill> : null}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-card border border-line bg-white px-6 py-5">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Mail size={16} className="text-ink-soft" />
                <p className="text-[13px] text-ink-soft">Need a change to your record? Ask the facility administrator.</p>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-[12px] text-muted">
              <LogOut size={14} /> Signing out ends this device session only.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export const instant = false;
