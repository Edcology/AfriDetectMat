import { redirect } from "next/navigation";
import { connection } from "next/server";
import { AppShell } from "@/components/shell/app-shell";
import { resolveActor } from "@/lib/auth/actor";
import { auth } from "@/lib/auth/server";
import { getDb } from "@/lib/store";

export const instant = false;

export default async function ClinicLayout({ children }: LayoutProps<"/">) {
  await connection();

  const { data } = await auth.getSession();
  if (!data?.user) redirect("/login");

  const actor = await resolveActor(data.user);
  if (!actor) redirect("/login?mode=signup");

  const db = await getDb();
  const searchIndex = db.patients.map(({ name, id, slug, status }) => ({ name, id, slug, status }));

  return (
    <AppShell
      searchIndex={searchIndex}
      unreadCount={db.notifications.filter((notification) => !notification.read).length}
      alertCount={db.alerts.filter((alert) => !alert.acknowledged).length}
    >
      {children}
    </AppShell>
  );
}
