import { Download, FileText } from "lucide-react";
import { MotherHeader } from "@/components/mother/ui";
import { UnderlineTabs } from "@/components/ui/tabs";
import { clinicians, clinicianName } from "@/lib/data";
import { clock, relativeDay } from "@/lib/format";
import { MOTHER_SLUG, documents, testResults } from "@/lib/mother-data";
import { getDb } from "@/lib/store";

export const instant = false;
export const metadata = { title: "Health records" };

export default async function RecordsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab = "reading" } = await searchParams;
  const db = await getDb();
  const patient = db.patients.find((entry) => entry.slug === MOTHER_SLUG) ?? db.patients[0];
  const readings = [...patient.readings].reverse();
  const usual = readings.map((reading) => reading.systolic);

  return (
    <div className="flex flex-col gap-6">
      <MotherHeader title="Health records" subtitle="Your readings, results and documents in one place" />

      <UnderlineTabs
        active={tab === "overview" ? "Overview" : tab === "tests" ? "Test results" : tab === "documents" ? "Documents" : "Reading"}
        items={[
          { href: "/mother/records?tab=overview", label: "Overview" },
          { href: "/mother/records?tab=reading", label: "Reading" },
          { href: "/mother/records?tab=tests", label: "Test results" },
          { href: "/mother/records?tab=documents", label: "Documents" },
        ]}
      />

      {tab === "reading" ? (
        <div className="overflow-hidden rounded-[16px] border border-line bg-white">
          <div className="flex flex-wrap items-center justify-between gap-3 px-6 pt-5 pb-2">
            <h2 className="card-title">Blood pressure readings</h2>
            <p className="text-[12px] text-ink-soft">Compared with your usual range of {Math.min(...usual)}–{Math.max(...usual)} mmHg</p>
          </div>
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-line-soft text-ink [&>th]:px-6 [&>th]:py-3 [&>th]:font-medium">
                <th className="w-[20%] text-[14px]">Date</th>
                <th className="w-[30%] text-[14px]">Blood pressure</th>
                <th className="text-[14px]">Compared with your usual</th>
              </tr>
            </thead>
            <tbody>
              {readings.map((reading) => {
                const close = Math.abs(reading.systolic - usual[usual.length - 1]) <= 10;
                return (
                  <tr key={reading.at} className="border-b border-line-soft last:border-0">
                    <td className="px-6 py-4 text-[14px] text-ink">{relativeDay(new Date(reading.at))}</td>
                    <td className="px-6 py-4 text-[14px] text-ink">
                      {reading.systolic}/{reading.diastolic} mmHg
                    </td>
                    <td className={`px-6 py-4 text-[14px] ${close ? "text-ink" : "text-warn"}`}>
                      {close ? "Close to usual" : "Slightly different"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : null}

      {tab === "overview" ? (
        <div className="flex flex-col gap-6">
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { label: "Weeks pregnant", value: `${patient.weeks}w ${patient.days}d` },
              { label: "Estimated due date", value: patient.edd },
              { label: "Your clinician", value: clinicianName(patient.clinicianId) },
            ].map((card) => (
              <div key={card.label} className="rounded-[16px] border border-line bg-white px-6 py-5">
                <p className="text-[12px] text-ink-soft">{card.label}</p>
                <p className="mt-2 text-[20px] leading-[26px] font-semibold text-ink">{card.value}</p>
              </div>
            ))}
          </div>

          <div className="rounded-[16px] border border-line bg-white px-6 py-5">
            <h2 className="card-title">What your care team is watching</h2>
            <ul className="mt-3 flex flex-col gap-2 text-[14px] leading-[21px] text-ink">
              <li>· Blood pressure at every check-in — your last reading was {readings[0]?.systolic}/{readings[0]?.diastolic} mmHg.</li>
              <li>· Symptoms you report in daily check-ins.</li>
              <li>· Urine protein at each visit.</li>
              <li>· Your baby&apos;s growth and heartbeat at appointments.</li>
            </ul>
            <p className="mt-4 text-[12px] text-muted">
              Care team: {clinicians.map((clinician) => clinician.name).join(", ")} · last updated{" "}
              {relativeDay(new Date(patient.lastCheckIn))} at {clock(new Date(patient.lastCheckIn))}
            </p>
          </div>
        </div>
      ) : null}

      {tab === "tests" ? (
        <div className="overflow-hidden rounded-[16px] border border-line bg-white">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-line-soft text-ink [&>th]:px-6 [&>th]:py-3 [&>th]:text-[14px] [&>th]:font-medium">
                <th className="w-[32%]">Test</th>
                <th className="w-[28%]">Your result</th>
                <th>Reference</th>
              </tr>
            </thead>
            <tbody>
              {testResults.map((result) => (
                <tr key={result.name} className="border-b border-line-soft last:border-0">
                  <td className="px-6 py-4 text-[14px] text-ink">{result.name}</td>
                  <td className="px-6 py-4 text-[14px] font-medium text-ink">{result.value}</td>
                  <td className="px-6 py-4 text-[14px] text-ink-soft">{result.range}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {tab === "documents" ? (
        <div className="flex flex-col gap-3">
          {documents.map((document) => (
            <div
              key={document.name}
              className="flex flex-wrap items-center justify-between gap-4 rounded-[16px] border border-line bg-white px-6 py-4"
            >
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-[10px] bg-surface-muted text-ink-soft">
                  <FileText size={18} />
                </span>
                <div>
                  <p className="text-[14px] font-medium text-ink">{document.name}</p>
                  <p className="text-[12px] text-muted">
                    {document.kind} · {document.date} · {document.size}
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="inline-flex h-[33px] items-center gap-2 rounded-[8px] border border-line px-4 text-[12px] text-ink-soft hover:text-ink"
              >
                <Download size={14} /> Download
              </button>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
