import { redirect } from "next/navigation";
import { connection } from "next/server";
import { MotherShell } from "@/components/mother/mother-shell";
import { auth } from "@/lib/auth/server";
import { getDb } from "@/lib/store";

export const instant = false;

export const metadata = {
  title: "My pregnancy",
};

export default async function MotherLayout({ children }: { children: React.ReactNode }) {
  await connection();

  // Temporary gate until phone-OTP sign-in ships: the mother app holds a real
  // patient record, so it must not be readable by anyone who guesses the URL.
  // Any signed-in account can view it for now; scoping to one patient_id is the
  // next step and is tracked in the README.
  const { data } = await auth.getSession();
  if (!data?.user) redirect("/login");

  const db = await getDb();
  const unread = db.threads.reduce((total, thread) => total + thread.unread, 0);

  return (
    <MotherShell profileName={db.motherProfile.name} unread={unread}>
      {children}
    </MotherShell>
  );
}
