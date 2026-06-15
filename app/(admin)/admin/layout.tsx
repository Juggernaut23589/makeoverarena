import { headers } from "next/headers";
import { AdminShell } from "@/components/admin/admin-shell";
import type { AdminRole } from "@/lib/admin-auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const hdrs = await headers();
  const pathname = hdrs.get("x-pathname") ?? "";

  if (pathname === "/admin/login") return <>{children}</>;

  const role = (hdrs.get("x-admin-role") ?? "admin") as AdminRole;
  const adminName = hdrs.get("x-admin-name") ?? "";

  return <AdminShell role={role} adminName={adminName}>{children}</AdminShell>;
}
