import { MotherShell } from "@/components/mother/mother-shell";
import { getDb } from "@/lib/store";

export const instant = false;

export const metadata = {
  title: "My pregnancy",
};

export default async function MotherLayout({ children }: { children: React.ReactNode }) {
  const db = await getDb();
  const unread = db.threads.reduce((total, thread) => total + thread.unread, 0);

  return (
    <MotherShell profileName={db.motherProfile.name} unread={unread}>
      {children}
    </MotherShell>
  );
}
