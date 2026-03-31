import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ClientDashboard } from "@/components/client/client-dashboard";

export default async function ClientDashboardPage() {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await db
    .from("client_profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/login?setup=1");

  const [applicationsResult, paymentsResult, consultationsResult] = await Promise.all([
    db
      .from("application_tracking")
      .select("*")
      .eq("client_id", user.id)
      .order("created_at", { ascending: false }),
    db
      .from("payments")
      .select("*")
      .eq("client_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("consultations")
      .select("id, student_name, scheduled_date, scheduled_time, timezone, status, outcome, meeting_link, consultant_id")
      .eq("student_email", profile.email as string)
      .order("scheduled_date", { ascending: false }),
  ]);

  return (
    <ClientDashboard
      profile={profile}
      applications={applicationsResult.data ?? []}
      payments={paymentsResult.data ?? []}
      consultations={consultationsResult.data ?? []}
    />
  );
}
