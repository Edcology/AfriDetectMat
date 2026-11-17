import { Building2, Mail, Users } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Pill } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/card";
import { Table, TBody, TD, TH, THead, TR, TableWrap } from "@/components/ui/table";
import { UnderlineTabs } from "@/components/ui/tabs";
import { facility } from "@/lib/data";
import { getDb } from "@/lib/store";

export const metadata = { title: "Facility admin" };

export default async function FacilityAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab = "overview" } = await searchParams;
  const db = await getDb();
  const activeStaff = db.staff.filter((member) => member.status === "active").length;
  const invited = db.staff.filter((member) => member.status === "invited").length;

  return (
    <div className="flex flex-col gap-6 pt-2">
      <PageHeader
        title="Facility admin"
        subtitle={`${facility.name} · ${facility.location}`}
      />

      <UnderlineTabs
        active={tab === "staff" ? "Staff directory" : tab === "details" ? "Facility details" : "Overview"}
        items={[
          { href: "/facility-admin", label: "Overview" },
          { href: "/facility-admin?tab=staff", label: "Staff directory" },
          { href: "/facility-admin?tab=details", label: "Facility details" },
        ]}
      />

      {tab === "overview" ? (
        <div className="flex flex-col gap-5">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { label: "Registered patients", value: db.patients.length, icon: Users },
              { label: "Active staff", value: activeStaff, icon: Users },
              { label: "Invitations pending", value: invited, icon: Mail },
              { label: "Antenatal beds", value: facility.beds, icon: Building2 },
            ].map((card) => {
              const Icon = card.icon;
              return (
                <div key={card.label} className="rounded-card border border-line bg-white px-6 py-5">
                  <div className="flex items-center justify-between">
                    <p className="label-xs">{card.label}</p>
                    <Icon size={16} className="text-muted" />
                  </div>
                  <p className="mt-3 text-[32px] leading-[40px] font-bold text-ink">{card.value}</p>
                </div>
              );
            })}
          </div>

          <div className="grid items-start gap-5 xl:grid-cols-[1.3fr_1fr]">
            <div className="overflow-hidden rounded-card border border-line bg-white">
              <div className="px-6 pt-5 pb-3">
                <h2 className="card-title">Care team</h2>
              </div>
              <TableWrap>
                <Table>
                  <THead>
                    <TH className="w-[40%]">Name</TH>
                    <TH className="w-[26%]">Role</TH>
                    <TH className="w-[20%]">Patients</TH>
                    <TH>Status</TH>
                  </THead>
                  <TBody>
                    {db.staff.slice(0, 5).map((member) => (
                      <TR key={member.id}>
                        <TD>
                          <span className="flex items-center gap-3">
                            <Avatar name={member.name} size={28} tone="soft" />
                            <span className="flex flex-col">
                              <span>{member.name}</span>
                              <span className="text-[12px] text-muted">{member.email}</span>
                            </span>
                          </span>
                        </TD>
                        <TD className="text-ink-soft">{member.role}</TD>
                        <TD>{member.patients}</TD>
                        <TD>
                          <Pill tone={member.status === "active" ? "success" : member.status === "invited" ? "warn" : "neutral"}>
                            {member.status}
                          </Pill>
                        </TD>
                      </TR>
                    ))}
                  </TBody>
                </Table>
              </TableWrap>
            </div>

            <div className="rounded-card border border-line bg-white px-6 py-5">
              <h2 className="card-title">Facility details</h2>
              <dl className="mt-4 flex flex-col gap-4 text-[14px]">
                {[
                  ["Name", facility.name],
                  ["Type", facility.kind],
                  ["Location", facility.location],
                  ["Antenatal beds", String(facility.beds)],
                  ["Staff on record", String(facility.staff)],
                ].map(([label, value]) => (
                  <div key={label} className="flex flex-col gap-1 border-b border-line-soft pb-3 last:border-0 last:pb-0">
                    <dt className="text-[12px] text-muted">{label}</dt>
                    <dd className="font-medium text-ink">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      ) : null}

      {tab === "staff" ? (
        <div className="overflow-hidden rounded-card border border-line bg-white">
          <TableWrap>
            <Table>
              <THead>
                <TH className="w-[34%]">Name</TH>
                <TH className="w-[24%]">Role</TH>
                <TH className="w-[28%]">Email</TH>
                <TH className="w-[10%]">Patients</TH>
                <TH>Status</TH>
              </THead>
              <TBody>
                {db.staff.map((member) => (
                  <TR key={member.id}>
                    <TD>
                      <span className="flex items-center gap-3">
                        <Avatar name={member.name} size={28} tone="soft" />
                        {member.name}
                      </span>
                    </TD>
                    <TD className="text-ink-soft">{member.role}</TD>
                    <TD className="text-ink-soft">{member.email}</TD>
                    <TD>{member.patients}</TD>
                    <TD>
                      <Pill tone={member.status === "active" ? "success" : member.status === "invited" ? "warn" : "neutral"}>
                        {member.status}
                      </Pill>
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </TableWrap>
        </div>
      ) : null}

      {tab === "details" ? (
        <div className="grid items-start gap-5 xl:grid-cols-2">
          <div className="rounded-card border border-line bg-white px-6 py-5">
            <h2 className="card-title">Facility details</h2>
            <dl className="mt-4 flex flex-col gap-4 text-[14px]">
              {[
                ["Name", facility.name],
                ["Type", facility.kind],
                ["Location", facility.location],
                ["Antenatal beds", String(facility.beds)],
                ["Staff on record", String(facility.staff)],
                ["Screening protocol", "Protocol A — hypertension in pregnancy"],
              ].map(([label, value]) => (
                <div key={label} className="flex flex-col gap-1 border-b border-line-soft pb-3 last:border-0 last:pb-0">
                  <dt className="text-[12px] text-muted">{label}</dt>
                  <dd className="font-medium text-ink">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="rounded-card border border-line bg-white px-6 py-5">
            <h2 className="card-title">Data & audit</h2>
            <p className="mt-2 text-[13px] leading-[19px] text-ink-soft">
              Every record change is attributed to a named clinician and kept for seven years. Patient consent events are
              logged alongside clinical activity.
            </p>
            <div className="mt-4 flex flex-col gap-2 text-[13px]">
              {[
                ["Records stored", `${db.patients.length} antenatal records`],
                ["Audit entries", `${db.activities.length} this period`],
                ["Access requests", `${db.accessRequests.length} logged`],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between border-b border-line-soft pb-2 last:border-0">
                  <span className="text-muted">{label}</span>
                  <span className="font-medium text-ink">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export const instant = false;
