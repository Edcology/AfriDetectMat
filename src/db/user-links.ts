import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

/**
 * Bridge between Managed Better Auth (which owns neon_auth.user) and this
 * application's permissions. Everything authorization-related reads from here:
 * a clinician is scoped to one facility, a mother to exactly one patient record.
 */
export const userLinks = pgTable("user_links", {
  /** neon_auth.user.id */
  userId: text("user_id").primaryKey(),
  role: text("role").notNull(), // 'clinician' | 'mother'
  facilityId: text("facility_id"),
  clinicianId: text("clinician_id"),
  patientId: text("patient_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
