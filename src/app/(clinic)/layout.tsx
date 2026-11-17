import { AppShell } from "@/components/shell/app-shell";
import { getDb } from "@/lib/store";

export const instant = false;

export default async function ClinicLayout({ children }: LayoutProps<"/">) {
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
