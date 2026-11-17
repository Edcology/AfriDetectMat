"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { currentUser, facility } from "@/lib/data";
import { MOTHER_SLUG, concernSymptoms, symptoms } from "@/lib/mother-data";
import { classifyReading, screenForHypertension } from "@/lib/screening";
import { getDb, mutate, nextPatientId, slugify } from "@/lib/store";
import type { ActionState } from "@/lib/action-state";
import type { Patient, Reading } from "@/lib/types";

const nowIso = () => new Date().toISOString();

function refresh(...paths: string[]) {
  for (const path of ["/", "/patients", "/alerts", "/monitoring", "/screening", "/appointments", ...paths]) {
    revalidatePath(path);
  }
}

export async function createPatient(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const name = String(formData.get("name") ?? "").trim();
  const age = Number(formData.get("age") ?? 0);
  const phone = String(formData.get("phone") ?? "").trim();
  const weeks = Number(formData.get("weeks") ?? 0);
  const days = Number(formData.get("days") ?? 0);
  const clinicianId = String(formData.get("clinicianId") ?? currentUser.id);
  const edd = String(formData.get("edd") ?? "").trim();
  const history = String(formData.get("history") ?? "").trim();
  const systolic = Number(formData.get("systolic") ?? 0);
  const diastolic = Number(formData.get("diastolic") ?? 0);

  if (name.length < 2) return { status: "error", message: "Enter the patient's full name." };
  if (!Number.isFinite(age) || age < 12 || age > 60)
    return { status: "error", message: "Age must be between 12 and 60." };
  if (!Number.isFinite(weeks) || weeks < 0 || weeks > 42)
    return { status: "error", message: "Gestational age must be between 0 and 42 weeks." };
  if (phone.replace(/\D/g, "").length < 7) return { status: "error", message: "Enter a reachable phone number." };

  const db = await getDb();
  if (db.patients.some((patient) => patient.name.toLowerCase() === name.toLowerCase()))
    return { status: "error", message: "A patient with that name is already registered." };

  let slug = slugify(name);
  if (db.patients.some((patient) => patient.slug === slug)) slug = `${slug}-${Date.now().toString().slice(-4)}`;

  const readings: Reading[] =
    systolic > 0 && diastolic > 0
      ? [{ at: nowIso(), systolic, diastolic, source: "clinician", verified: true }]
      : [];

  const patient: Patient = {
    id: nextPatientId(db),
    slug,
    name,
    age,
    weeks,
    days,
    edd: edd || "To be confirmed",
    phone,
    clinicianId,
    facilityId: facility.id,
    status: readings.length ? classifyReading(systolic, diastolic) : "more-data",
    lastCheckIn: nowIso(),
    history: history || "New registration — history to be taken.",
    gravida: 1,
    para: 0,
    bloodGroup: "Unknown",
    genotype: "Unknown",
    allergies: [],
    conditions: [],
    readings,
    urineProtein: null,
    carePlan: "Routine antenatal schedule. Complete booking investigations.",
    riskFactors: [],
    notes: [],
  };

  await mutate((draft) => {
    draft.patients.unshift(patient);
    draft.activities.unshift({
      id: `act-${Date.now()}`,
      at: nowIso(),
      actor: currentUser.name,
      action: "New patient registered",
      subject: patient.name,
    });
  });

  refresh(`/patients/${patient.slug}`);
  redirect(`/patients/${patient.slug}`);
}

export async function scheduleAppointment(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const patientId = String(formData.get("patientId") ?? "");
  const reason = String(formData.get("reason") ?? "").trim();
  const date = String(formData.get("date") ?? "");
  const time = String(formData.get("time") ?? "");
  const clinicianId = String(formData.get("clinicianId") ?? currentUser.id);

  if (!patientId) return { status: "error", message: "Choose a patient." };
  if (!reason) return { status: "error", message: "Add a reason for the visit." };
  if (!date || !time) return { status: "error", message: "Pick a date and time." };

  const at = new Date(`${date}T${time}:00`);
  if (Number.isNaN(at.getTime())) return { status: "error", message: "That date and time is not valid." };

  const db = await getDb();
  const patient = db.patients.find((entry) => entry.id === patientId);
  if (!patient) return { status: "error", message: "That patient is no longer registered." };

  await mutate((draft) => {
    draft.appointments.push({
      id: `apt-${Date.now()}`,
      patientId: patient.id,
      patientName: patient.name,
      reason,
      at: at.toISOString(),
      clinicianId,
      state: "upcoming",
      location: "Antenatal clinic · Room 1",
    });
    draft.activities.unshift({
      id: `act-${Date.now()}`,
      at: nowIso(),
      actor: currentUser.name,
      action: "Appointment scheduled",
      subject: patient.name,
    });
  });

  refresh(`/patients/${patient.slug}`);
  revalidatePath("/appointments");
  return { status: "success", message: `Visit booked for ${patient.name}.` };
}

export async function acknowledgeAlert(formData: FormData) {
  const id = String(formData.get("alertId") ?? "");
  if (!id) return;

  await mutate((draft) => {
    const alert = draft.alerts.find((entry) => entry.id === id);
    if (!alert) return;
    alert.acknowledged = true;
    alert.assignedTo = currentUser.id;
    draft.notifications = draft.notifications.map((notification) =>
      notification.id === `nt-${alert.id}` ? { ...notification, read: true } : notification
    );
    draft.activities.unshift({
      id: `act-${Date.now()}`,
      at: nowIso(),
      actor: currentUser.name,
      action: "Alert acknowledged",
      subject: alert.patientName,
    });
  });

  refresh();
}

export async function logReading(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const patientId = String(formData.get("patientId") ?? "");
  const systolic = Number(formData.get("systolic") ?? 0);
  const diastolic = Number(formData.get("diastolic") ?? 0);

  if (!patientId) return { status: "error", message: "Choose a patient." };
  if (!systolic || !diastolic) return { status: "error", message: "Enter both systolic and diastolic values." };
  if (systolic < 60 || systolic > 260 || diastolic < 30 || diastolic > 160)
    return { status: "error", message: "That reading is outside the accepted range — check the numbers." };
  if (diastolic >= systolic) return { status: "error", message: "Diastolic must be lower than systolic." };

  const severity = classifyReading(systolic, diastolic);

  const slug = await mutate((draft) => {
    const patient = draft.patients.find((entry) => entry.id === patientId);
    if (!patient) return "";
    patient.readings.push({ at: nowIso(), systolic, diastolic, source: "clinician", verified: true });
    patient.lastCheckIn = nowIso();
    const result = screenForHypertension(patient);
    patient.status = result.severity;

    if (severity !== "routine") {
      draft.alerts.unshift({
        id: `al-${Date.now()}`,
        patientId: patient.id,
        patientName: patient.name,
        severity,
        title:
          severity === "urgent"
            ? "Severe blood pressure reading recorded"
            : "Raised blood pressure reading recorded",
        detail: `Clinician-verified reading of ${systolic}/${diastolic} mmHg.`,
        at: nowIso(),
        assignedTo: null,
        acknowledged: false,
      });
    }
    return patient.slug;
  });

  refresh();
  if (slug) revalidatePath(`/patients/${slug}`);
  return {
    status: "success",
    message:
      severity === "urgent"
        ? "Reading saved. Severe range — same-day review required."
        : severity === "review"
          ? "Reading saved. Raised range — confirm with a second reading."
          : "Reading saved. Within the expected range.",
  };
}

export async function addNote(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const patientId = String(formData.get("patientId") ?? "");
  const body = String(formData.get("body") ?? "").trim();
  if (!patientId) return { status: "error", message: "Patient is required." };
  if (body.length < 4) return { status: "error", message: "Write a little more detail before saving." };

  const slug = await mutate((draft) => {
    const patient = draft.patients.find((entry) => entry.id === patientId);
    if (!patient) return "";
    patient.notes.unshift({
      id: `n-${Date.now()}`,
      at: nowIso(),
      author: currentUser.name,
      body,
    });
    draft.activities.unshift({
      id: `act-${Date.now()}`,
      at: nowIso(),
      actor: currentUser.name,
      action: "Note added",
      subject: patient.name,
    });
    return patient.slug;
  });

  if (slug) revalidatePath(`/patients/${slug}`);
  return { status: "success", message: "Note saved." };
}

export async function updateCarePlan(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const patientId = String(formData.get("patientId") ?? "");
  const plan = String(formData.get("plan") ?? "").trim();
  if (!patientId) return { status: "error", message: "Patient is required." };
  if (plan.length < 8) return { status: "error", message: "The care plan needs a little more detail." };

  const slug = await mutate((draft) => {
    const patient = draft.patients.find((entry) => entry.id === patientId);
    if (!patient) return "";
    patient.carePlan = plan;
    return patient.slug;
  });

  if (slug) revalidatePath(`/patients/${slug}`);
  return { status: "success", message: "Care plan updated." };
}

export async function sendReferral(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const patientId = String(formData.get("patientId") ?? "");
  const destination = String(formData.get("destination") ?? "").trim();
  const reason = String(formData.get("reason") ?? "").trim();
  const urgency = String(formData.get("urgency") ?? "routine") === "urgent" ? "urgent" : "routine";

  if (!patientId) return { status: "error", message: "Choose a patient." };
  if (destination.length < 3) return { status: "error", message: "Where is the patient being referred?" };
  if (reason.length < 8) return { status: "error", message: "Add a clinical reason for the referral." };

  await mutate((draft) => {
    const patient = draft.patients.find((entry) => entry.id === patientId);
    if (!patient) return;
    draft.referrals.unshift({
      id: `r-${Date.now()}`,
      patientId: patient.id,
      patientName: patient.name,
      destination,
      reason,
      at: nowIso(),
      state: "in-progress",
      urgency,
    });
    draft.activities.unshift({
      id: `act-${Date.now()}`,
      at: nowIso(),
      actor: currentUser.name,
      action: "Referral sent",
      subject: patient.name,
    });
  });

  revalidatePath("/referrals");
  refresh();
  return { status: "success", message: `Referral sent to ${destination}.` };
}

export async function resolveAccessRequest(formData: FormData) {
  const id = String(formData.get("requestId") ?? "");
  const decision = String(formData.get("decision") ?? "");
  if (!id || !["granted", "declined"].includes(decision)) return;

  await mutate((draft) => {
    const request = draft.accessRequests.find((entry) => entry.id === id);
    if (!request) return;
    request.status = decision as "granted" | "declined";
    draft.activities.unshift({
      id: `act-${Date.now()}`,
      at: nowIso(),
      actor: currentUser.name,
      action: decision === "granted" ? "Record access granted" : "Record access declined",
      subject: request.patientName,
    });
  });

  revalidatePath("/mother-access");
}

export async function markNotificationsRead() {
  await mutate((draft) => {
    draft.notifications = draft.notifications.map((notification) => ({ ...notification, read: true }));
  });
  revalidatePath("/notifications");
}

/* ---------------------------------------------------------------- mother view */

export async function submitCheckIn(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const feeling = String(formData.get("feeling") ?? "");
  const note = String(formData.get("note") ?? "").trim();
  const picked = formData.getAll("symptoms").map(String);

  if (!["good", "mixed", "support"].includes(feeling))
    return { status: "error", message: "Choose how today feels before sending." };

  const flagged = picked.filter((symptom) => concernSymptoms.includes(symptom));

  await mutate((draft) => {
    const patient = draft.patients.find((entry) => entry.slug === MOTHER_SLUG);
    draft.checkIns.unshift({
      id: `c-${Date.now()}`,
      at: nowIso(),
      feeling: feeling as "good" | "mixed" | "support",
      symptoms: picked,
      note,
    });
    if (patient) {
      patient.lastCheckIn = nowIso();
      if (flagged.length > 0) {
        const labels = flagged
          .map((id) => symptoms.find((symptom) => symptom.id === id)?.label.toLowerCase())
          .filter(Boolean)
          .join(" and ");
        draft.alerts.unshift({
          id: `al-${Date.now()}`,
          patientId: patient.id,
          patientName: patient.name,
          severity: flagged.length > 1 ? "urgent" : "review",
          title: `Check-in flagged: ${labels}`,
          detail: note || `Reported ${labels} in today's check-in.`,
          at: nowIso(),
          assignedTo: null,
          acknowledged: false,
        });
        draft.notifications.unshift({
          id: `nt-${Date.now()}`,
          at: nowIso(),
          title: `Check-in alert · ${patient.name}`,
          body: `Reported ${labels}. Review before the end of the day.`,
          kind: "alert",
          read: false,
        });
      }
    }
  });

  refresh("/mother", "/mother/check-in", "/mother/records");
  revalidatePath("/mother");

  return {
    status: "success",
    message:
      flagged.length > 0
        ? "Check-in sent. Because of what you reported, your care team has been alerted and will review it today."
        : "Check-in sent to your care team. Thank you for sharing.",
  };
}

export async function sendMotherMessage(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const threadId = String(formData.get("threadId") ?? "");
  const body = String(formData.get("body") ?? "").trim();
  if (!threadId) return { status: "error", message: "Choose someone to message." };
  if (body.length < 2) return { status: "error", message: "Write a message first." };

  await mutate((draft) => {
    draft.messages.push({
      id: `m-${Date.now()}`,
      threadId,
      from: "mother",
      body,
      at: nowIso(),
    });
  });

  revalidatePath("/mother/messages");
  return { status: "success", message: "Message sent." };
}

export async function saveMotherProfile(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();
  const nextOfKin = String(formData.get("nextOfKin") ?? "").trim();
  const consentShare = formData.get("consentShare") === "on";

  if (name.length < 2) return { status: "error", message: "Enter your full name." };
  if (phone.replace(/\D/g, "").length < 7) return { status: "error", message: "Enter a phone number you can be reached on." };
  if (address.length < 5) return { status: "error", message: "Add your address so we can match your facility record." };

  await mutate((draft) => {
    draft.motherProfile = {
      ...draft.motherProfile,
      setupComplete: true,
      name,
      phone,
      address,
      nextOfKin,
      consentShare,
    };
    const patient = draft.patients.find((entry) => entry.slug === MOTHER_SLUG);
    if (patient) patient.phone = phone;
  });

  revalidatePath("/mother");
  revalidatePath("/mother/profile");
  return { status: "success", message: "Your details are saved and linked to your facility record." };
}

export async function markThreadRead(formData: FormData) {
  const threadId = String(formData.get("threadId") ?? "");
  if (!threadId) return;
  await mutate((draft) => {
    const thread = draft.threads.find((entry) => entry.id === threadId);
    if (thread) thread.unread = 0;
  });
  revalidatePath("/mother/messages");
}
