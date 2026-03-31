import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function ClientLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Check if this is actually a staff member trying to access client area
  const { data: staffProfile } = await supabase
    .from("staff_profiles")
    .select("id")
    .eq("id", user.id)
    .single();

  if (staffProfile) {
    redirect("/staff/dashboard");
  }

  return <>{children}</>;
}
