-- Bridge between Managed Better Auth (neon_auth schema) and app permissions.
CREATE TABLE IF NOT EXISTS "user_links" (
  "user_id" text PRIMARY KEY,
  "role" text NOT NULL,
  "facility_id" text,
  "clinician_id" text,
  "patient_id" text,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT "user_links_role_check" CHECK ("role" IN ('clinician', 'mother'))
);

CREATE INDEX IF NOT EXISTS "user_links_patient_idx" ON "user_links" ("patient_id");
CREATE INDEX IF NOT EXISTS "user_links_facility_idx" ON "user_links" ("facility_id");
