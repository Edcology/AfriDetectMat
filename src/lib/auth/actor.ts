import { eq } from "drizzle-orm";
import { db } from "@/db";
import { clinicians } from "@/db/schema";
import { userLinks } from "@/db/user-links";
import { facility } from "@/lib/data";

export interface Actor {
  userId: string;
  role: "clinician" | "mother";
  facilityId: string | null;
  clinicianId: string | null;
  patientId: string | null;
}

/**
 * Maps an auth user to what they are allowed to see. Runs once per session
 * (idempotent), so a clinician invited by the facility admin is linked the
 * first time they sign in.
 */
export async function resolveActor(user: { id: string; email?: string | null }): Promise<Actor | null> {
  const client = db();
  const existing = await client.select().from(userLinks).where(eq(userLinks.userId, user.id)).limit(1);
  if (existing[0]) {
    return {
      userId: existing[0].userId,
      role: existing[0].role as Actor["role"],
      facilityId: existing[0].facilityId,
      clinicianId: existing[0].clinicianId,
      patientId: existing[0].patientId,
    };
  }

  const email = user.email?.toLowerCase() ?? "";
  if (!email.endsWith("@harbour.health")) return null;

  const match = await client.select().from(clinicians).where(eq(clinicians.email, email)).limit(1);

  const [link] = await client
    .insert(userLinks)
    .values({
      userId: user.id,
      role: "clinician",
      facilityId: facility.id,
      clinicianId: match[0]?.id ?? null,
    })
    .returning();

  return {
    userId: link.userId,
    role: "clinician",
    facilityId: link.facilityId,
    clinicianId: link.clinicianId,
    patientId: link.patientId,
  };
}
