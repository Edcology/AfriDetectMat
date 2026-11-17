export type ReviewStatus = "urgent" | "review" | "routine" | "more-data";

export type ReadingSource = "patient" | "clinician";

export interface Reading {
  /** ISO date-time */
  at: string;
  systolic: number;
  diastolic: number;
  source: ReadingSource;
  verified: boolean;
}

export interface Patient {
  id: string;
  slug: string;
  name: string;
  age: number;
  weeks: number;
  days: number;
  edd: string;
  phone: string;
  clinicianId: string;
  facilityId: string;
  status: ReviewStatus;
  lastCheckIn: string;
  history: string;
  gravida: number;
  para: number;
  bloodGroup: string;
  genotype: string;
  allergies: string[];
  conditions: string[];
  readings: Reading[];
  urineProtein: string | null;
  notes: PatientNote[];
  carePlan: string;
  riskFactors: string[];
}

export interface PatientNote {
  id: string;
  at: string;
  author: string;
  body: string;
}

export interface Clinician {
  id: string;
  name: string;
  role: string;
  initials: string;
  facilityId: string;
}

export interface Facility {
  id: string;
  name: string;
  kind: string;
  location: string;
  beds: number;
  staff: number;
}

export type AppointmentState = "completed" | "upcoming" | "missed";

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  reason: string;
  /** ISO date-time */
  at: string;
  clinicianId: string;
  state: AppointmentState;
  location: string;
}

export interface Alert {
  id: string;
  patientId: string;
  patientName: string;
  severity: ReviewStatus;
  title: string;
  detail: string;
  at: string;
  assignedTo: string | null;
  acknowledged: boolean;
}

export interface Referral {
  id: string;
  patientId: string;
  patientName: string;
  destination: string;
  reason: string;
  at: string;
  state: "in-progress" | "accepted" | "closed";
  urgency: "urgent" | "routine";
}

export interface ActivityItem {
  id: string;
  at: string;
  actor: string;
  action: string;
  subject?: string;
}

export interface AppNotification {
  id: string;
  at: string;
  title: string;
  body: string;
  kind: "alert" | "message" | "referral" | "system";
  read: boolean;
}

export interface Staff {
  id: string;
  name: string;
  role: string;
  email: string;
  status: "active" | "invited" | "inactive";
  patients: number;
}

export interface AccessRequest {
  id: string;
  patientId: string;
  patientName: string;
  scope: string;
  note: string;
  requestedAt: string;
  status: "pending" | "granted" | "declined";
}
