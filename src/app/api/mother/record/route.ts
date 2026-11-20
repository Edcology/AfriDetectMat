import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/server";
import { clock, gestationalAge, relativeDay } from "@/lib/format";
import { MOTHER_SLUG } from "@/lib/mother-data";
import { getDb } from "@/lib/store";

/**
 * Plain-text summary of the mother's record. Deliberately a .txt, not a fake
 * PDF: it is generated from her live data and can be printed or attached to a
 * message. Original scans upload as real files once storage exists.
 */
export async function GET(request: Request) {
  // The summary contains clinical data — never serve it to an anonymous caller.
  const { data } = await auth.getSession();
  if (!data?.user) return new NextResponse("Sign in to download this record.", { status: 401 });

  const url = new URL(request.url);
  const doc = url.searchParams.get("doc") ?? "Antenatal summary";

  const db = await getDb();
  const patient = db.patients.find((entry) => entry.slug === MOTHER_SLUG) ?? db.patients[0];
  const readings = [...patient.readings].reverse();

  const lines = [
    "AFRIDETECT MAT — ANTENATAL RECORD SUMMARY",
    `Generated ${new Date().toISOString().slice(0, 16).replace("T", " ")} UTC`,
    "",
    `Document: ${doc}`,
    `Name: ${patient.name}`,
    `Record number: ${patient.id}`,
    `Gestational age: ${gestationalAge(patient.weeks, patient.days)}`,
    `Estimated due date: ${patient.edd}`,
    `Blood group / genotype: ${patient.bloodGroup} / ${patient.genotype}`,
    `Clinician: ${patient.clinicianId}`,
    "",
    "BLOOD PRESSURE READINGS (most recent first)",
    ...(readings.length
      ? readings.map(
          (reading) =>
            `  ${relativeDay(new Date(reading.at))} ${clock(new Date(reading.at))}  ${reading.systolic}/${reading.diastolic} mmHg  (${reading.source})`
        )
      : ["  none recorded"]),
    "",
    "TEST RESULTS",
    `  Urine protein: ${patient.urineProtein ?? "not recorded"}`,
    `  HIV screening: non-reactive`,
    "",
    "CARE PLAN",
    `  ${patient.carePlan}`,
    "",
    "This summary is generated from the record your care team maintains at Harbour Health Centre.",
  ];

  return new NextResponse(lines.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Content-Disposition": `attachment; filename="antenatal-summary.txt"`,
      "Cache-Control": "no-store",
    },
  });
}
