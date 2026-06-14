import { supabaseAdmin } from "@/lib/supabase";
import { StaffDashboard } from "@/components/staff/staff-dashboard";

export default async function StaffDashboardPage() {
  const db = supabaseAdmin;
  const supabase = supabaseAdmin;

  const defaultStaff = {
    id: "demo-staff",
    role: "admin" as const,
    full_name: "Demo Staff",
    email: "admin@makeoverarena.com",
    avatar_url: null,
  };

  const [clientsResult, consultationsResult, inquiriesResult] = await Promise.all([
    db?.from("client_profiles")
      .select("id, full_name, email, service_type, payment_status, created_at")
      .order("created_at", { ascending: false })
      .limit(20) ?? { data: [] },
    supabase?.from("consultations")
      .select("id, student_name, student_email, scheduled_date, scheduled_time, status, outcome")
      .order("scheduled_date", { ascending: false })
      .limit(20) ?? { data: [] },
    supabase?.from("inquiries")
      .select("id, full_name, email, service_type, status, priority, created_at")
      .order("created_at", { ascending: false })
      .limit(20) ?? { data: [] },
  ]);

  const [paymentsResult, inquiryStatsResult] = await Promise.all([
    db?.from("payments").select("amount, status, currency, created_at") ?? { data: [] },
    supabase?.from("daily_inquiry_stats").select("*").limit(30) ?? { data: [] },
  ]);

  const analyticsData = {
    payments: paymentsResult.data ?? [],
    inquiryStats: inquiryStatsResult.data ?? [],
  };

  const { data: staffList } = supabase
    ? await supabase.from("staff_profiles").select("id, full_name, email, role, created_at")
    : { data: [] };

  return (
    <StaffDashboard
      staff={defaultStaff}
      clients={clientsResult.data ?? []}
      consultations={consultationsResult.data ?? []}
      inquiries={inquiriesResult.data ?? []}
      analyticsData={analyticsData}
      staffList={staffList ?? []}
    />
  );
}
