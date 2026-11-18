/**
 * Seeds Postgres from the same fixtures the JSON store used.
 *
 *   DATABASE_URL=postgres://... node scripts/seed.ts
 *
 * Idempotent: truncates the tables it owns before inserting.
 */
import postgres from "postgres";
import {
  accessRequests,
  activities,
  alerts,
  appointments,
  clinicians,
  facility,
  notifications,
  patients,
  referrals,
  staff,
} from "../src/lib/data.ts";
import { checkIns, messages, motherProfile, threads } from "../src/lib/mother-data.ts";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set.");
  process.exit(1);
}

const sql = postgres(url, { max: 1 });
const iso = (value: string) => new Date(value);

await sql.unsafe(`
  TRUNCATE facilities, clinicians, staff, patients, readings, patient_notes,
  appointments, alerts, referrals, activities, notifications, access_requests,
  check_ins, threads, messages, mother_profile RESTART IDENTITY CASCADE;
`);

await sql`INSERT INTO facilities ${sql([facility], "id", "name", "kind", "location", "beds")}`;
await sql`UPDATE facilities SET staff_count = ${facility.staff}`;

await sql`INSERT INTO clinicians ${sql(
  clinicians.map((row) => ({
    id: row.id,
    name: row.name,
    role: row.role,
    initials: row.initials,
    facility_id: row.facilityId,
    email: row.id === "c-adika" ? "adika.nwosu@harbour.health" : null,
  })),
  "id",
  "name",
  "role",
  "initials",
  "facility_id",
  "email"
)}`;

await sql`INSERT INTO staff ${sql(
  staff.map((row) => ({ ...row, facility_id: facility.id })),
  "id",
  "name",
  "role",
  "email",
  "status",
  "patients",
  "facility_id"
)}`;

await sql`INSERT INTO patients ${sql(
  patients.map((row) => ({
    id: row.id,
    slug: row.slug,
    name: row.name,
    age: row.age,
    weeks: row.weeks,
    days: row.days,
    edd: row.edd,
    phone: row.phone,
    clinician_id: row.clinicianId,
    facility_id: row.facilityId,
    status: row.status,
    last_check_in: iso(row.lastCheckIn),
    history: row.history,
    gravida: row.gravida,
    para: row.para,
    blood_group: row.bloodGroup,
    genotype: row.genotype,
    allergies: row.allergies,
    conditions: row.conditions,
    urine_protein: row.urineProtein,
    care_plan: row.carePlan,
    risk_factors: row.riskFactors,
  })),
  "id",
  "slug",
  "name",
  "age",
  "weeks",
  "days",
  "edd",
  "phone",
  "clinician_id",
  "facility_id",
  "status",
  "last_check_in",
  "history",
  "gravida",
  "para",
  "blood_group",
  "genotype",
  "allergies",
  "conditions",
  "urine_protein",
  "care_plan",
  "risk_factors"
)}`;

const readings = patients.flatMap((patient) =>
  patient.readings.map((reading) => ({
    patient_id: patient.id,
    at: iso(reading.at),
    systolic: reading.systolic,
    diastolic: reading.diastolic,
    source: reading.source,
    verified: reading.verified,
  }))
);
await sql`INSERT INTO readings ${sql(readings, "patient_id", "at", "systolic", "diastolic", "source", "verified")}`;

const notes = patients.flatMap((patient) =>
  patient.notes.map((note) => ({ id: note.id, patient_id: patient.id, at: iso(note.at), author: note.author, body: note.body }))
);
if (notes.length) {
  await sql`INSERT INTO patient_notes ${sql(notes, "id", "patient_id", "at", "author", "body")}`;
}

await sql`INSERT INTO appointments ${sql(
  appointments.map((row) => ({
    id: row.id,
    patient_id: row.patientId,
    patient_name: row.patientName,
    reason: row.reason,
    at: iso(row.at),
    clinician_id: row.clinicianId,
    state: row.state,
    location: row.location,
  })),
  "id",
  "patient_id",
  "patient_name",
  "reason",
  "at",
  "clinician_id",
  "state",
  "location"
)}`;

await sql`INSERT INTO alerts ${sql(
  alerts.map((row) => ({
    id: row.id,
    patient_id: row.patientId,
    patient_name: row.patientName,
    severity: row.severity,
    title: row.title,
    detail: row.detail,
    at: iso(row.at),
    assigned_to: row.assignedTo,
    acknowledged: row.acknowledged,
  })),
  "id",
  "patient_id",
  "patient_name",
  "severity",
  "title",
  "detail",
  "at",
  "assigned_to",
  "acknowledged"
)}`;

await sql`INSERT INTO referrals ${sql(
  referrals.map((row) => ({
    id: row.id,
    patient_id: row.patientId,
    patient_name: row.patientName,
    destination: row.destination,
    reason: row.reason,
    at: iso(row.at),
    state: row.state,
    urgency: row.urgency,
  })),
  "id",
  "patient_id",
  "patient_name",
  "destination",
  "reason",
  "at",
  "state",
  "urgency"
)}`;

await sql`INSERT INTO activities ${sql(
  activities.map((row) => ({ id: row.id, at: iso(row.at), actor: row.actor, action: row.action, subject: row.subject ?? null })),
  "id",
  "at",
  "actor",
  "action",
  "subject"
)}`;

await sql`INSERT INTO notifications ${sql(
  notifications.map((row) => ({
    id: row.id,
    at: iso(row.at),
    title: row.title,
    body: row.body,
    kind: row.kind,
    read: row.read,
  })),
  "id",
  "at",
  "title",
  "body",
  "kind",
  "read"
)}`;

await sql`INSERT INTO access_requests ${sql(
  accessRequests.map((row) => ({
    id: row.id,
    patient_id: row.patientId,
    patient_name: row.patientName,
    scope: row.scope,
    note: row.note,
    requested_at: iso(row.requestedAt),
    status: row.status,
  })),
  "id",
  "patient_id",
  "patient_name",
  "scope",
  "note",
  "requested_at",
  "status"
)}`;

await sql`INSERT INTO check_ins ${sql(
  checkIns.map((row) => ({ id: row.id, at: iso(row.at), feeling: row.feeling, symptoms: row.symptoms, note: row.note })),
  "id",
  "at",
  "feeling",
  "symptoms",
  "note"
)}`;

await sql`INSERT INTO threads ${sql(threads, "id", "name", "role", "note", "unread")}`;

await sql`INSERT INTO messages ${sql(
  messages.map((row) => ({ id: row.id, thread_id: row.threadId, from_role: row.from, body: row.body, at: iso(row.at) })),
  "id",
  "thread_id",
  "from_role",
  "body",
  "at"
)}`;

const motherPatient = patients.find((row) => row.slug === "amara-okafor") ?? patients[0];
await sql`INSERT INTO mother_profile ${sql(
  [
    {
      id: 1,
      setup_complete: motherProfile.setupComplete,
      name: motherProfile.name,
      phone: motherProfile.phone,
      address: motherProfile.address,
      next_of_kin: motherProfile.nextOfKin,
      language: motherProfile.language,
      consent_share: motherProfile.consentShare,
      patient_id: motherPatient.id,
    },
  ],
  "id",
  "setup_complete",
  "name",
  "phone",
  "address",
  "next_of_kin",
  "language",
  "consent_share",
  "patient_id"
)}`;

await sql.end();
console.log(
  `seeded: ${patients.length} patients · ${readings.length} readings · ${appointments.length} appointments · ${alerts.length} alerts`
);
