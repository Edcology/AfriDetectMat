import { and, desc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import * as t from "@/db/schema";
import type {
  AccessRequest,
  ActivityItem,
  Alert,
  Appointment,
  AppNotification,
  Clinician,
  Patient,
  Referral,
  ReviewStatus,
  Staff,
} from "@/lib/types";
import type { ChatMessage, CheckIn, MotherProfile, Thread } from "@/lib/mother-types";

export interface Db {
  patients: Patient[];
  appointments: Appointment[];
  alerts: Alert[];
  referrals: Referral[];
  activities: ActivityItem[];
  notifications: AppNotification[];
  staff: Staff[];
  accessRequests: AccessRequest[];
  checkIns: CheckIn[];
  threads: Thread[];
  messages: ChatMessage[];
  motherProfile: MotherProfile;
  motherPatientId: string;
}

const iso = (value: Date | string) => (value instanceof Date ? value.toISOString() : value);

/** One read of the workspace. Fine at pilot scale; list views paginate later. */
export async function loadDb(): Promise<Db> {
  const client = db();
  const [
    patientRows,
    readingRows,
    noteRows,
    appointmentRows,
    alertRows,
    referralRows,
    activityRows,
    notificationRows,
    staffRows,
    accessRows,
    checkInRows,
    threadRows,
    messageRows,
    motherRows,
  ] = await Promise.all([
    client.select().from(t.patients).orderBy(desc(t.patients.createdAt)),
    client.select().from(t.readings).orderBy(t.readings.at),
    client.select().from(t.patientNotes).orderBy(desc(t.patientNotes.at)),
    client.select().from(t.appointments).orderBy(t.appointments.at),
    client.select().from(t.alerts).orderBy(desc(t.alerts.at)),
    client.select().from(t.referrals).orderBy(desc(t.referrals.at)),
    client.select().from(t.activities).orderBy(desc(t.activities.at)),
    client.select().from(t.notifications).orderBy(desc(t.notifications.at)),
    client.select().from(t.staff),
    client.select().from(t.accessRequests).orderBy(desc(t.accessRequests.requestedAt)),
    client.select().from(t.checkIns).orderBy(desc(t.checkIns.at)),
    client.select().from(t.threads),
    client.select().from(t.messages).orderBy(t.messages.at),
    client.select().from(t.motherProfile),
  ]);

  const patients: Patient[] = patientRows.map((row) => ({
    id: row.id,
    slug: row.slug,
    name: row.name,
    age: row.age,
    weeks: row.weeks,
    days: row.days,
    edd: row.edd,
    phone: row.phone,
    clinicianId: row.clinicianId,
    facilityId: row.facilityId,
    status: row.status as ReviewStatus,
    lastCheckIn: iso(row.lastCheckIn),
    history: row.history,
    gravida: row.gravida,
    para: row.para,
    bloodGroup: row.bloodGroup,
    genotype: row.genotype,
    allergies: row.allergies,
    conditions: row.conditions,
    urineProtein: row.urineProtein,
    carePlan: row.carePlan,
    riskFactors: row.riskFactors,
    readings: readingRows
      .filter((reading) => reading.patientId === row.id)
      .map((reading) => ({
        at: iso(reading.at),
        systolic: reading.systolic,
        diastolic: reading.diastolic,
        source: reading.source as "patient" | "clinician",
        verified: reading.verified,
      })),
    notes: noteRows
      .filter((note) => note.patientId === row.id)
      .map((note) => ({ id: note.id, at: iso(note.at), author: note.author, body: note.body })),
  }));

  const mother = motherRows[0];

  return {
    patients,
    appointments: appointmentRows.map((row) => ({
      id: row.id,
      patientId: row.patientId,
      patientName: row.patientName,
      reason: row.reason,
      at: iso(row.at),
      clinicianId: row.clinicianId,
      state: row.state as Appointment["state"],
      location: row.location,
    })),
    alerts: alertRows.map((row) => ({
      id: row.id,
      patientId: row.patientId,
      patientName: row.patientName,
      severity: row.severity as ReviewStatus,
      title: row.title,
      detail: row.detail,
      at: iso(row.at),
      assignedTo: row.assignedTo,
      acknowledged: row.acknowledged,
    })),
    referrals: referralRows.map((row) => ({
      id: row.id,
      patientId: row.patientId,
      patientName: row.patientName,
      destination: row.destination,
      reason: row.reason,
      at: iso(row.at),
      state: row.state as Referral["state"],
      urgency: row.urgency as Referral["urgency"],
    })),
    activities: activityRows.map((row) => ({
      id: row.id,
      at: iso(row.at),
      actor: row.actor,
      action: row.action,
      subject: row.subject ?? undefined,
    })),
    notifications: notificationRows.map((row) => ({
      id: row.id,
      at: iso(row.at),
      title: row.title,
      body: row.body,
      kind: row.kind as AppNotification["kind"],
      read: row.read,
    })),
    staff: staffRows.map((row) => ({
      id: row.id,
      name: row.name,
      role: row.role,
      email: row.email,
      status: row.status as Staff["status"],
      patients: row.patients,
    })),
    accessRequests: accessRows.map((row) => ({
      id: row.id,
      patientId: row.patientId,
      patientName: row.patientName,
      scope: row.scope,
      note: row.note,
      requestedAt: iso(row.requestedAt),
      status: row.status as AccessRequest["status"],
    })),
    checkIns: checkInRows.map((row) => ({
      id: row.id,
      at: iso(row.at),
      feeling: row.feeling as CheckIn["feeling"],
      symptoms: row.symptoms,
      note: row.note,
    })),
    threads: threadRows.map((row) => ({
      id: row.id,
      name: row.name,
      role: row.role,
      note: row.note,
      unread: row.unread,
    })),
    messages: messageRows.map((row) => ({
      id: row.id,
      threadId: row.threadId,
      from: row.fromRole as ChatMessage["from"],
      body: row.body,
      at: iso(row.at),
    })),
    motherProfile: mother
      ? {
          setupComplete: mother.setupComplete,
          name: mother.name,
          phone: mother.phone,
          address: mother.address,
          nextOfKin: mother.nextOfKin,
          language: mother.language,
          consentShare: mother.consentShare,
        }
      : { setupComplete: false, name: "", phone: "", address: "", nextOfKin: "", language: "English", consentShare: true },
    motherPatientId: mother?.patientId ?? "",
  };
}

/* ------------------------------------------------------------------ writers */

export async function insertPatient(patient: Patient) {
  const client = db();
  await client.insert(t.patients).values({
    id: patient.id,
    slug: patient.slug,
    name: patient.name,
    age: patient.age,
    weeks: patient.weeks,
    days: patient.days,
    edd: patient.edd,
    phone: patient.phone,
    clinicianId: patient.clinicianId,
    facilityId: patient.facilityId,
    status: patient.status,
    lastCheckIn: new Date(patient.lastCheckIn),
    history: patient.history,
    gravida: patient.gravida,
    para: patient.para,
    bloodGroup: patient.bloodGroup,
    genotype: patient.genotype,
    allergies: patient.allergies,
    conditions: patient.conditions,
    urineProtein: patient.urineProtein,
    carePlan: patient.carePlan,
    riskFactors: patient.riskFactors,
  });
  for (const reading of patient.readings) {
    await insertReading(patient.id, reading);
  }
}

export async function insertReading(
  patientId: string,
  reading: { at: string; systolic: number; diastolic: number; source: string; verified: boolean }
) {
  await db().insert(t.readings).values({
    patientId,
    at: new Date(reading.at),
    systolic: reading.systolic,
    diastolic: reading.diastolic,
    source: reading.source,
    verified: reading.verified,
  });
}

export async function patchPatient(
  patientId: string,
  patch: { status?: ReviewStatus; lastCheckIn?: string; carePlan?: string; phone?: string }
) {
  await db()
    .update(t.patients)
    .set({
      ...(patch.status ? { status: patch.status } : {}),
      ...(patch.lastCheckIn ? { lastCheckIn: new Date(patch.lastCheckIn) } : {}),
      ...(patch.carePlan ? { carePlan: patch.carePlan } : {}),
      ...(patch.phone ? { phone: patch.phone } : {}),
    })
    .where(eq(t.patients.id, patientId));
}

export async function insertNote(note: { id: string; patientId: string; at: string; author: string; body: string }) {
  await db().insert(t.patientNotes).values({ ...note, at: new Date(note.at) });
}

export async function insertAppointment(row: Appointment) {
  await db().insert(t.appointments).values({ ...row, at: new Date(row.at) });
}

export async function insertAlert(row: Alert) {
  await db().insert(t.alerts).values({ ...row, at: new Date(row.at) });
}

export async function acknowledgeAlertById(id: string, clinicianId: string) {
  await db().update(t.alerts).set({ acknowledged: true, assignedTo: clinicianId }).where(eq(t.alerts.id, id));
}

export async function insertReferral(row: Referral) {
  await db().insert(t.referrals).values({ ...row, at: new Date(row.at) });
}

export async function insertActivity(row: ActivityItem) {
  await db().insert(t.activities).values({ ...row, at: new Date(row.at) });
}

export async function insertNotification(row: AppNotification) {
  await db().insert(t.notifications).values({ ...row, at: new Date(row.at) });
}

export async function markNotificationsRead() {
  await db().update(t.notifications).set({ read: true }).where(eq(t.notifications.read, false));
}

export async function insertCheckIn(row: CheckIn) {
  await db().insert(t.checkIns).values({ ...row, at: new Date(row.at) });
}

export async function insertMessage(row: ChatMessage) {
  await db().insert(t.messages).values({
    id: row.id,
    threadId: row.threadId,
    fromRole: row.from,
    body: row.body,
    at: new Date(row.at),
  });
}

export async function setAccessRequestStatus(id: string, status: "granted" | "declined") {
  await db().update(t.accessRequests).set({ status }).where(eq(t.accessRequests.id, id));
}

export async function setThreadRead(threadId: string) {
  await db().update(t.threads).set({ unread: 0 }).where(eq(t.threads.id, threadId));
}

export async function saveMotherProfile(patch: MotherProfile) {
  await db()
    .update(t.motherProfile)
    .set({
      setupComplete: patch.setupComplete,
      name: patch.name,
      phone: patch.phone,
      address: patch.address,
      nextOfKin: patch.nextOfKin,
      language: patch.language,
      consentShare: patch.consentShare,
    })
    .where(eq(t.motherProfile.id, 1));
}

export async function acknowledgeAssociatedNotifications(alertId: string) {
  await db().update(t.notifications).set({ read: true }).where(eq(t.notifications.id, `nt-${alertId}`));
}

export function nextPatientId(patients: { id: string }[]) {
  const highest = patients.reduce((acc, patient) => {
    const numeric = Number.parseInt(patient.id.replace(/\D/g, ""), 10);
    return Number.isFinite(numeric) ? Math.max(acc, numeric) : acc;
  }, 1041);
  return `MC-${highest + 1}`;
}

export function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

export { and, eq, inArray, t };
