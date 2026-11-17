import type { Patient, Reading, ReviewStatus } from "@/lib/types";

export interface ScreeningResult {
  severity: ReviewStatus;
  headline: string;
  reasons: string[];
  moreData: string | null;
  latest: Reading | null;
}

const SEVERE_SYSTOLIC = 160;
const SEVERE_DIASTOLIC = 110;
const RAISED_SYSTOLIC = 140;
const RAISED_DIASTOLIC = 90;

const hoursBetween = (a: string, b: string) => Math.abs(new Date(a).getTime() - new Date(b).getTime()) / 3_600_000;

/**
 * Hypertension in pregnancy — Protocol A.
 * A single severe reading is enough; raised readings need two at least four
 * hours apart. A missing result is never treated as normal.
 */
export function screenForHypertension(patient: Patient): ScreeningResult {
  const readings = [...patient.readings].sort((a, b) => a.at.localeCompare(b.at));
  const latest = readings[readings.length - 1] ?? null;
  const moreData = patient.urineProtein ? null : "Urine protein results";

  if (!latest) {
    return {
      severity: "more-data",
      headline: "No blood pressure reading recorded",
      reasons: ["No reading has been submitted for this pregnancy."],
      moreData: moreData ?? "Blood pressure reading",
      latest: null,
    };
  }

  const severe = readings.filter((r) => r.systolic >= SEVERE_SYSTOLIC || r.diastolic >= SEVERE_DIASTOLIC);
  const raised = readings.filter((r) => r.systolic >= RAISED_SYSTOLIC || r.diastolic >= RAISED_DIASTOLIC);

  if (severe.length > 0) {
    const worst = severe[severe.length - 1];
    const reasons = [
      `Latest reading ${latest.systolic}/${latest.diastolic} mmHg is in the severe range (${SEVERE_SYSTOLIC}/${SEVERE_DIASTOLIC} or higher)`,
    ];
    if (worst.at !== latest.at) {
      reasons.push(`Severe reading ${worst.systolic}/${worst.diastolic} mmHg recorded earlier in this pregnancy`);
    }
    if (patient.riskFactors.some((factor) => /headache|swelling/i.test(factor))) {
      reasons.push("Headache and swelling of the hands reported alongside raised blood pressure");
    }
    return {
      severity: "urgent",
      headline: "Severe hypertension — same-day review",
      reasons,
      moreData,
      latest,
    };
  }

  if (raised.length >= 2) {
    const confirmed = raised.some((reading, index) => {
      const next = raised[index + 1];
      return next ? hoursBetween(reading.at, next.at) >= 4 : false;
    });
    return {
      severity: confirmed ? "review" : "review",
      headline: confirmed
        ? "Raised blood pressure confirmed on two readings"
        : "Raised blood pressure — confirm with a second reading",
      reasons: [
        `${raised.length} readings at or above ${RAISED_SYSTOLIC}/${RAISED_DIASTOLIC} mmHg`,
        confirmed ? "Confirmed at least four hours apart" : "Second reading at least four hours later is still needed",
      ],
      moreData,
      latest,
    };
  }

  if (moreData) {
    return {
      severity: "more-data",
      headline: "No raised reading — urinalysis outstanding",
      reasons: [`No reading at or above ${RAISED_SYSTOLIC}/${RAISED_DIASTOLIC} mmHg`],
      moreData,
      latest,
    };
  }

  return {
    severity: "routine",
    headline: "Blood pressure within the expected range",
    reasons: [`No reading at or above ${RAISED_SYSTOLIC}/${RAISED_DIASTOLIC} mmHg`],
    moreData: null,
    latest,
  };
}

export function classifyReading(systolic: number, diastolic: number): ReviewStatus {
  if (systolic >= SEVERE_SYSTOLIC || diastolic >= SEVERE_DIASTOLIC) return "urgent";
  if (systolic >= RAISED_SYSTOLIC || diastolic >= RAISED_DIASTOLIC) return "review";
  return "routine";
}

export const protocol = {
  name: "Protocol A",
  headline: "Hypertension in pregnancy",
  rules: [
    "Hypertension: 140/90 mmHg or higher",
    "Severe: 160/110 mmHg or higher",
    "Confirm on two readings at least 4 hours apart; one severe reading is enough",
    "Pre-eclampsia: raised BP after 20 weeks with protein in urine (1+ on dipstick)",
    "Protein tested at every visit",
  ],
};

export const glucoseProtocol = {
  headline: "Diabetes in pregnancy",
  rules: [
    "Fasting plasma glucose 5.1–6.9 mmol/L",
    "1-hour glucose 10.0 mmol/L or higher after a 75 g load",
    "2-hour glucose 8.5–11.0 mmol/L after a 75 g load",
    "Any one criterion meets the diagnosis",
  ],
  footnote:
    "Diabetes in pregnancy: fasting 7.0 or higher, 2-hour 11.1 or higher, or random 11.1 or higher with symptoms.",
};
