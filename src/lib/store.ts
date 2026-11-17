import { promises as fs } from "node:fs";
import path from "node:path";
import { connection } from "next/server";
import {
  accessRequests,
  activities,
  alerts,
  appointments,
  notifications,
  patients,
  referrals,
  staff,
} from "@/lib/data";
import { checkIns, messages, motherProfile, threads } from "@/lib/mother-data";
import type { CheckIn, ChatMessage, MotherProfile, Thread } from "@/lib/mother-types";
import type {
  AccessRequest,
  ActivityItem,
  Alert,
  Appointment,
  AppNotification,
  Patient,
  Referral,
  Staff,
} from "@/lib/types";

export interface Db {
  version: number;
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
}

/** Bump when the shape of the seed changes so local data re-seeds. */
const SEED_VERSION = 6;
const FILE = path.join(process.cwd(), ".data", "db.json");

const seedDb = (): Db => ({
  version: SEED_VERSION,
  patients: structuredClone(patients),
  appointments: structuredClone(appointments),
  alerts: structuredClone(alerts),
  referrals: structuredClone(referrals),
  activities: structuredClone(activities),
  notifications: structuredClone(notifications),
  staff: structuredClone(staff),
  accessRequests: structuredClone(accessRequests),
  checkIns: structuredClone(checkIns),
  threads: structuredClone(threads),
  messages: structuredClone(messages),
  motherProfile: structuredClone(motherProfile),
});

declare global {
  // eslint-disable-next-line no-var
  var __afridetectDb: Db | undefined;
}

export async function getDb(): Promise<Db> {
  // The workspace is a live clinical record: always read it at request time so
  // no page is served from a build-time snapshot.
  await connection();

  if (globalThis.__afridetectDb && globalThis.__afridetectDb.version === SEED_VERSION) {
    return globalThis.__afridetectDb;
  }

  try {
    const raw = await fs.readFile(FILE, "utf8");
    const parsed = JSON.parse(raw) as Db;
    if (parsed.version === SEED_VERSION) {
      globalThis.__afridetectDb = parsed;
      return parsed;
    }
  } catch {
    // no local store yet — fall through and seed
  }

  const fresh = seedDb();
  await persist(fresh);
  return fresh;
}

async function persist(db: Db) {
  globalThis.__afridetectDb = db;
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  await fs.writeFile(FILE, JSON.stringify(db, null, 2), "utf8");
}

/** Read → change → write. Every mutation funnels through here. */
export async function mutate<T>(change: (db: Db) => T | Promise<T>): Promise<T> {
  const db = await getDb();
  const result = await change(db);
  await persist(db);
  return result;
}

export function nextPatientId(db: Db) {
  const highest = db.patients.reduce((acc, patient) => {
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
