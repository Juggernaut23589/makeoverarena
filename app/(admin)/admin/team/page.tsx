import type { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";
import { getAdminSession } from "@/app/(admin)/admin/login/actions";
import { redirect } from "next/navigation";
import { TeamClient } from "./team-client";

export const metadata: Metadata = { title: "Team | Admin" };

export default async function TeamPage() {
  const session = await getAdminSession();
  if (!session || session.role !== "super_admin") redirect("/admin?error=forbidden");

  const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: members } = await adminClient
    .from("staff_profiles")
    .select("id, full_name, email, role, is_active, created_at, phone, avatar_url")
    .in("role", ["super_admin", "admin"])
    .order("created_at", { ascending: true });

  return <TeamClient members={members ?? []} currentUserId={session.userId} />;
}
