import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { CheckInForm } from "@/components/mother/check-in-form";
import { MotherHeader } from "@/components/mother/ui";
import { clock, relativeDay } from "@/lib/format";
import { feelings, symptoms } from "@/lib/mother-data";
import { getDb } from "@/lib/store";

export const instant = false;
export const metadata = { title: "Daily check-in" };

export default async function CheckInPage() {
  const db = await getDb();
  const recent = db.checkIns.slice(0, 4);

  return (
    <div className="flex flex-col gap-6">
      <MotherHeader
        title="How are you feeling?"
        subtitle="Share a little about how you're doing today. Your care team really wants to know"
      />

      <div className="grid items-start gap-6 xl:grid-cols-[1fr_390px]">
        <CheckInForm />

        <div className="flex flex-col gap-6">
          <div className="rounded-[16px] border border-line bg-white px-6 py-5">
            <h2 className="card-title">Recent check-ins</h2>
            <div className="mt-3 flex flex-col gap-4">
              {recent.map((entry) => (
                <div key={entry.id} className="border-b border-line-soft pb-3 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[14px] font-medium text-ink">
                      {feelings.find((option) => option.id === entry.feeling)?.label ?? entry.feeling}
                    </p>
                    <p className="text-[11px] text-muted">
                      {relativeDay(new Date(entry.at))} · {clock(new Date(entry.at))}
                    </p>
                  </div>
                  <p className="mt-1 text-[12px] leading-[17px] text-ink-soft">
                    {entry.symptoms.length > 0
                      ? entry.symptoms.map((id) => symptoms.find((s) => s.id === id)?.label).join(", ")
                      : "No symptoms reported"}
                  </p>
                  {entry.note ? <p className="mt-1 text-[12px] leading-[17px] text-ink">{entry.note}</p> : null}
                </div>
              ))}
              {recent.length === 0 ? <p className="text-[13px] text-ink-soft">No check-ins yet.</p> : null}
            </div>
          </div>

          <div className="rounded-[16px] border border-[#f0bfc1] bg-[#fff8f4] px-6 py-5">
            <div className="flex items-start gap-2">
              <AlertCircle size={16} className="mt-0.5 shrink-0 text-danger" />
              <div>
                <p className="text-[15px] font-medium text-danger">Need help now?</p>
                <p className="mt-1 text-[13px] leading-[19px] text-danger/80">
                  This check-in is not monitored as an emergency service. If you feel seriously unwell or have urgent
                  symptoms, seek medical care now.
                </p>
                <Link
                  href="/mother/learn/when-you-get-urgent-help"
                  className="mt-2 inline-block text-[12px] font-semibold text-danger hover:underline"
                >
                  What counts as urgent?
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
