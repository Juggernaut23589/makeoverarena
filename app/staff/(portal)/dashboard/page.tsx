import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { StaffDashboard } from "@/components/staff/staff-dashboard";

export default async function StaffDashboardPage() {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/staff/login");

  const { data: _staffProfile } = await supabase
    .from("staff_profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!_staffProfile) redirect("/staff/login?error=unauthorized");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const profile = _staffProfile as any;

  const [clientsResult, consultationsResult, inquiriesResult] = await Promise.all([
    db.from("client_profiles")
      .select("id, full_name, email, service_type, payment_status, created_at")
      .order("created_at", { ascending: false })
      .limit(20),
    supabase
      .from("consultations")
      .select("id, student_name, student_email, scheduled_date, scheduled_time, status, outcome")
      .order("scheduled_date", { ascending: false })
      .limit(20),
    supabase
      .from("inquiries")
      .select("id, full_name, email, service_type, status, priority, created_at")
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  let analyticsData = null;
  if (["business_admin", "site_admin", "admin"].includes(profile.role)) {
    const [paymentsResult, inquiryStatsResult] = await Promise.all([
      db.from("payments").select("amount, status, currency, created_at"),
      supabase.from("daily_inquiry_stats").select("*").limit(30),
    ]);
    analyticsData = {
      payments: paymentsResult.data ?? [],
      inquiryStats: inquiryStatsResult.data ?? [],
    };
  }

  let staffList = null;
  if (["site_admin", "admin"].includes(profile.role)) {
    const { data } = await supabase
      .from("staff_profiles")
      .select("id, full_name, email, role, created_at");
    staffList = data ?? [];
  }

  return (
    <StaffDashboard
      staff={profile as Parameters<typeof StaffDashboard>[0]["staff"]}
      clients={clientsResult.data ?? []}
      consultations={consultationsResult.data ?? []}
      inquiries={inquiriesResult.data ?? []}
      analyticsData={analyticsData}
      staffList={staffList}
    />
  );
}
