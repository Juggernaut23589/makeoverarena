import type { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";
import { getAdminSession } from "@/app/(admin)/admin/login/actions";
import { redirect } from "next/navigation";
import { ClientsTable } from "./clients-table";

export const metadata: Metadata = { title: "Clients | Admin" };

export default async function ClientsPage() {
  const session = await getAdminSession();
  // Was super_admin-only, inconsistent with every other /admin page (which
  // relies on the middleware's session gate alone — see
  // lib/admin-auth.ts's SUPER_ADMIN_ROUTES). Viewing clients and raising a
  // payment is routine admin work, not a super_admin-only action; agent
  // assignment below stays restricted via requireSuperAdmin in actions.ts.
  if (!session || !["super_admin", "admin"].includes(session.role)) {
    redirect("/admin?error=forbidden");
  }

  const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const [{ data: clients }, { data: agents }] = await Promise.all([
    adminClient
      .from("client_profiles")
      .select("id, full_name, email, payment_status, assigned_staff_id, assigned_staff_name, created_at")
      .order("created_at", { ascending: false }),
    adminClient
      .from("staff_profiles")
      .select("id, full_name, email, is_active")
      .in("role", ["super_admin", "admin"])
      .eq("is_active", true),
  ]);

  return <ClientsTable clients={clients ?? []} agents={agents ?? []} />;
}
