import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { decodeSession, STAFF_COOKIE_NAME, hasAbility } from "@/lib/admin-auth";
import { supabaseAdmin } from "@/lib/supabase";
import { StaffDashboard } from "@/components/staff/staff-dashboard";
import { StaffPendingView } from "@/components/staff/staff-pending-view";

export default async function StaffDashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(STAFF_COOKIE_NAME)?.value;
  const session = token ? decodeSession(token) : null;
  if (!session) redirect("/staff/login");

  const db = supabaseAdmin;

  // Fetch live staff profile to get current abilities/status
  const { data: staffProfile } = await db!
    .from("staff_profiles")
    .select("id, full_name, email, role, is_active, is_pending, abilities, job_title, phone, avatar_url")
    .eq("id", session.userId)
    .single();

  if (!staffProfile) redirect("/staff/login");

  const isPending = staffProfile.is_pending || !staffProfile.is_active;
  if (isPending) {
    return <StaffPendingView staff={staffProfile} />;
  }

  // Build fresh session context from DB
  const liveSession = {
    ...session,
    abilities: staffProfile.abilities ?? {},
  };

  // Fetch only what this staff member can see
  const [clientsResult, consultationsResult, inquiriesResult] = await Promise.all([
    hasAbility(liveSession, "view_clients")
      ? db!.from("client_profiles")
          .select("id, full_name, email, service_type, payment_status, created_at")
          .order("created_at", { ascending: false })
          .limit(50)
      : Promise.resolve({ data: [] }),
    db!.from("consultations")
      .select("id, student_name, student_email, scheduled_date, scheduled_time, status, outcome")
      .order("scheduled_date", { ascending: false })
      .limit(20),
    db!.from("inquiries")
      .select("id, full_name, email, service_type, status, priority, created_at")
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  const [paymentsResult, inquiryStatsResult, clientSignupStats] = await Promise.all([
    hasAbility(liveSession, "view_payments") || hasAbility(liveSession, "view_analytics")
      ? db!.from("payments").select("amount, status, currency, created_at")
      : Promise.resolve({ data: [] }),
    hasAbility(liveSession, "view_analytics")
      ? db!.from("daily_inquiry_stats").select("*").limit(30)
      : Promise.resolve({ data: [] }),
    hasAbility(liveSession, "view_analytics")
      ? db!.from("client_profiles").select("created_at").order("created_at", { ascending: true })
      : Promise.resolve({ data: [] }),
  ]);

  // Agent performance: clients per assigned staff
  let agentStats: { staff_id: string; full_name: string; client_count: number }[] = [];
  if (hasAbility(liveSession, "view_analytics")) {
    const { data: assigned } = await db!
      .from("client_profiles")
      .select("assigned_staff_id, assigned_staff_name")
      .not("assigned_staff_id", "is", null);
    if (assigned) {
      const map: Record<string, { full_name: string; count: number }> = {};
      for (const row of assigned) {
        if (!row.assigned_staff_id) continue;
        if (!map[row.assigned_staff_id]) {
          map[row.assigned_staff_id] = { full_name: row.assigned_staff_name ?? "Unknown", count: 0 };
        }
        map[row.assigned_staff_id].count++;
      }
      agentStats = Object.entries(map).map(([id, v]) => ({
        staff_id: id,
        full_name: v.full_name,
        client_count: v.count,
      }));
    }
  }

  const { data: staffList } = liveSession.role === "super_admin"
    ? await db!.from("staff_profiles").select("id, full_name, email, role, is_active, is_pending, abilities, job_title, created_at").order("created_at", { ascending: true })
    : { data: [] };

  return (
    <StaffDashboard
      staff={{
        id: staffProfile.id,
        role: staffProfile.role,
        full_name: staffProfile.full_name,
        email: staffProfile.email,
        avatar_url: staffProfile.avatar_url,
      }}
      session={liveSession}
      clients={clientsResult.data ?? []}
      consultations={consultationsResult.data ?? []}
      inquiries={inquiriesResult.data ?? []}
      analyticsData={{
        payments: paymentsResult.data ?? [],
        inquiryStats: inquiryStatsResult.data ?? [],
        clientSignups: clientSignupStats.data ?? [],
        agentStats,
      }}
      staffList={staffList ?? []}
    />
  );
}
