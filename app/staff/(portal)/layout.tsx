import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function StaffLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/staff/login");
  }

  // Verify staff membership
  const { data: staffProfile } = await supabase
    .from("staff_profiles")
    .select("id, role, full_name")
    .eq("id", user.id)
    .single();

  if (!staffProfile) {
    redirect("/staff/login?error=unauthorized");
  }

  return <>{children}</>;
}
