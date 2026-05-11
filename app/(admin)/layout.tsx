import { AdminProvider } from "@/components/admin/admin-context";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminTheme } from "@/components/admin/admin-theme";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminTheme>
      <AdminProvider>
        <AdminShell>{children}</AdminShell>
      </AdminProvider>
    </AdminTheme>
  );
}
