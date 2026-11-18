import {
  boolean,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

/* ------------------------------------------------------------------ facility */

export const facilities = pgTable("facilities", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  kind: text("kind").notNull(),
  location: text("location").notNull(),
  beds: integer("beds").notNull().default(0),
  staffCount: integer("staff_count").notNull().default(0),
});

export const clinicians = pgTable("clinicians", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  role: text("role").notNull(),
  initials: text("initials").notNull(),
  facilityId: text("facility_id").notNull(),
  /** credentials — null until the clinician accepts their invitation */
  email: text("email").unique(),
  passwordHash: text("password_hash"),
});

export const staff = pgTable("staff", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  role: text("role").notNull(),
  email: text("email").notNull(),
  status: text("status").notNull().default("active"),
  patients: integer("patients").notNull().default(0),
  facilityId: text("facility_id").notNull(),
});

/* ------------------------------------------------------------------ clinical */

export const patients = pgTable("patients", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  age: integer("age").notNull(),
  weeks: integer("weeks").notNull(),
  days: integer("days").notNull(),
  edd: text("edd").notNull(),
  phone: text("phone").notNull(),
  clinicianId: text("clinician_id").notNull(),
  facilityId: text("facility_id").notNull(),
  status: text("status").notNull(),
  lastCheckIn: timestamp("last_check_in", { withTimezone: true }).notNull(),
  history: text("history").notNull().default(""),
  gravida: integer("gravida").notNull().default(1),
  para: integer("para").notNull().default(0),
  bloodGroup: text("blood_group").notNull().default("Unknown"),
  genotype: text("genotype").notNull().default("Unknown"),
  allergies: text("allergies").array().notNull().default([]),
  conditions: text("conditions").array().notNull().default([]),
  urineProtein: text("urine_protein"),
  carePlan: text("care_plan").notNull().default(""),
  riskFactors: text("risk_factors").array().notNull().default([]),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const readings = pgTable("readings", {
  id: serial("id").primaryKey(),
  patientId: text("patient_id").notNull(),
  at: timestamp("at", { withTimezone: true }).notNull(),
  systolic: integer("systolic").notNull(),
  diastolic: integer("diastolic").notNull(),
  source: text("source").notNull().default("patient"),
  verified: boolean("verified").notNull().default(false),
});

export const patientNotes = pgTable("patient_notes", {
  id: text("id").primaryKey(),
  patientId: text("patient_id").notNull(),
  at: timestamp("at", { withTimezone: true }).notNull(),
  author: text("author").notNull(),
  body: text("body").notNull(),
});

export const appointments = pgTable("appointments", {
  id: text("id").primaryKey(),
  patientId: text("patient_id").notNull(),
  patientName: text("patient_name").notNull(),
  reason: text("reason").notNull(),
  at: timestamp("at", { withTimezone: true }).notNull(),
  clinicianId: text("clinician_id").notNull(),
  state: text("state").notNull().default("upcoming"),
  location: text("location").notNull().default(""),
});

export const alerts = pgTable("alerts", {
  id: text("id").primaryKey(),
  patientId: text("patient_id").notNull(),
  patientName: text("patient_name").notNull(),
  severity: text("severity").notNull(),
  title: text("title").notNull(),
  detail: text("detail").notNull().default(""),
  at: timestamp("at", { withTimezone: true }).notNull(),
  assignedTo: text("assigned_to"),
  acknowledged: boolean("acknowledged").notNull().default(false),
});

export const referrals = pgTable("referrals", {
  id: text("id").primaryKey(),
  patientId: text("patient_id").notNull(),
  patientName: text("patient_name").notNull(),
  destination: text("destination").notNull(),
  reason: text("reason").notNull(),
  at: timestamp("at", { withTimezone: true }).notNull(),
  state: text("state").notNull().default("in-progress"),
  urgency: text("urgency").notNull().default("routine"),
});

export const activities = pgTable("activities", {
  id: text("id").primaryKey(),
  at: timestamp("at", { withTimezone: true }).notNull(),
  actor: text("actor").notNull(),
  action: text("action").notNull(),
  subject: text("subject"),
});

export const notifications = pgTable("notifications", {
  id: text("id").primaryKey(),
  at: timestamp("at", { withTimezone: true }).notNull(),
  title: text("title").notNull(),
  body: text("body").notNull(),
  kind: text("kind").notNull().default("system"),
  read: boolean("read").notNull().default(false),
});

export const accessRequests = pgTable("access_requests", {
  id: text("id").primaryKey(),
  patientId: text("patient_id").notNull(),
  patientName: text("patient_name").notNull(),
  scope: text("scope").notNull(),
  note: text("note").notNull().default(""),
  requestedAt: timestamp("requested_at", { withTimezone: true }).notNull(),
  status: text("status").notNull().default("pending"),
});

/* ---------------------------------------------------------------- mother app */

export const checkIns = pgTable("check_ins", {
  id: text("id").primaryKey(),
  at: timestamp("at", { withTimezone: true }).notNull(),
  feeling: text("feeling").notNull(),
  symptoms: text("symptoms").array().notNull().default([]),
  note: text("note").notNull().default(""),
});

export const threads = pgTable("threads", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  role: text("role").notNull(),
  note: text("note").notNull().default(""),
  unread: integer("unread").notNull().default(0),
});

export const messages = pgTable("messages", {
  id: text("id").primaryKey(),
  threadId: text("thread_id").notNull(),
  fromRole: text("from_role").notNull(),
  body: text("body").notNull(),
  at: timestamp("at", { withTimezone: true }).notNull(),
});

export const motherProfile = pgTable("mother_profile", {  id: integer("id").primaryKey().default(1),
  setupComplete: boolean("setup_complete").notNull().default(false),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  address: text("address").notNull().default(""),
  nextOfKin: text("next_of_kin").notNull().default(""),
  language: text("language").notNull().default("English"),
  consentShare: boolean("consent_share").notNull().default(true),
  /** the one patient record this mother may read */
  patientId: text("patient_id").notNull(),
});
