import type { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";
import { getAdminSession } from "@/app/(admin)/admin/login/actions";
import { redirect } from "next/navigation";
import { ClientsTable } from "./clients-table";

export const metadata: Metadata = { title: "Clients | Admin" };

export default async function ClientsPage() {
  const session = await getAdminSession();
  if (!session || session.role !== "super_admin") redirect("/admin?error=forbidden");

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
