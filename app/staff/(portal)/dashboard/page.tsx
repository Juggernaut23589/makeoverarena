import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { decodeSession, STAFF_COOKIE_NAME, hasAbility } from "@/lib/admin-auth";
import { supabaseAdmin } from "@/lib/supabase";
import { StaffDashboard } from "@/components/staff/staff-dashboard";
import { StaffPendingView } from "@/components/staff/staff-pending-view";

export default async function StaffDashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(STAFF_COOKIE_NAME)?.value;
  const session = token ? await decodeSession(token) : null;
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
  const [clientsResult] = await Promise.all([
    hasAbility(liveSession, "view_clients") || hasAbility(liveSession, "customer_support")
      ? db!.from("client_profiles")
          .select("id, full_name, email, current_access_class_id, subscription_expires_at, created_at")
          .order("created_at", { ascending: false })
          .limit(50)
      : Promise.resolve({ data: [] }),
  ]);

  const [paymentsResult] = await Promise.all([
    hasAbility(liveSession, "view_payments") || hasAbility(liveSession, "view_analytics")
      ? db!.from("payments").select("amount, status, currency, created_at")
      : Promise.resolve({ data: [] }),
  ]);

  const { data: scholarships } = (hasAbility(liveSession, "scholarship_research") || hasAbility(liveSession, "scholarship_verify") || hasAbility(liveSession, "scholarship_approve"))
    ? await db!
        .from("scholarships")
        .select(
          "id, name, institution_name, programme_name, destination_country, study_level, funding_type, description, eligibility_notes, amount, application_deadline, application_url, source_url, listing_status, is_active, last_checked_at, verified_by, verified_at, created_by, required_class_id, approved_by, approved_at, academic_qualifications, field_of_study"
        )
        .order("created_at", { ascending: false })
    : { data: [] };

  // Access classes are needed both by the Scholarships tab (to wire a
  // scholarship to a class) and the Pricing tab (super_admin only) — fetch
  // once here regardless of which ability the staff member has, since the
  // table is tiny and read-only outside the Pricing tab anyway.
  const { data: accessClasses } = await db!
    .from("access_classes")
    .select("id, name, slug, rank, description, is_active")
    .order("rank", { ascending: true });

  const { data: accessPeriods } = liveSession.role === "super_admin"
    ? await db!.from("access_periods").select("id, label, duration_days, display_order, is_active").order("display_order", { ascending: true })
    : { data: [] };

  const { data: accessClassPrices } = liveSession.role === "super_admin"
    ? await db!.from("access_class_prices").select("class_id, period_id, price_naira")
    : { data: [] };

  const { data: staffList } = liveSession.role === "super_admin"
    ? await db!.from("staff_profiles").select("id, full_name, email, role, is_active, is_pending, abilities, job_title, created_at").order("created_at", { ascending: true })
    : { data: [] };

  // Scholarship/subscription report — reuses view_analytics, no new ability.
  let reportData = null;
  if (hasAbility(liveSession, "view_analytics")) {
    const [tierStats, revenueByTier, subsThisYear, awaitingVerification, awaitingApproval, topViewed, topSearched] = await Promise.all([
      db!.from("subscription_tier_stats").select("*"),
      db!.from("subscription_revenue_by_tier").select("*").order("month", { ascending: true }),
      db!.from("client_subscriptions").select("client_id, started_at, expires_at").order("started_at", { ascending: true }),
      db!.from("scholarships").select("id", { count: "exact", head: true }).eq("listing_status", "to_be_verified"),
      db!.from("scholarships").select("id", { count: "exact", head: true }).eq("listing_status", "verified"),
      db!.from("scholarships").select("name, view_count").order("view_count", { ascending: false }).limit(10),
      db!.from("scholarship_search_logs").select("query"),
    ]);

    // "Lapsed" — a client's most recent subscription row has expired and no
    // later row for the same client exists. Explicitly not "cancellations":
    // this prepaid model has no cancel action, so this is the closest real
    // equivalent and is labeled as such in the UI.
    const latestByClient = new Map<string, { expires_at: string }>();
    for (const row of subsThisYear.data ?? []) {
      const prev = latestByClient.get(row.client_id);
      if (!prev || new Date(row.started_at) > new Date((prev as unknown as { started_at: string }).started_at ?? 0)) {
        latestByClient.set(row.client_id, row as unknown as { expires_at: string });
      }
    }
    const lapsedCount = [...latestByClient.values()].filter((r) => new Date(r.expires_at).getTime() < Date.now()).length;

    const searchCounts: Record<string, number> = {};
    for (const row of topSearched.data ?? []) {
      const key = row.query.trim().toLowerCase();
      if (!key) continue;
      searchCounts[key] = (searchCounts[key] ?? 0) + 1;
    }
    const topSearchTerms = Object.entries(searchCounts).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([query, count]) => ({ query, count }));

    reportData = {
      tierStats: tierStats.data ?? [],
      revenueByTier: revenueByTier.data ?? [],
      newSubscriptionsCount: (subsThisYear.data ?? []).length,
      lapsedCount,
      awaitingVerificationCount: awaitingVerification.count ?? 0,
      awaitingApprovalCount: awaitingApproval.count ?? 0,
      topViewed: topViewed.data ?? [],
      topSearchTerms,
    };
  }

  // Personalized "awaiting your action" queue — visible to whoever actually
  // holds the verify/approve ability, independent of view_analytics (the
  // Reports tab's global counts above are a different, aggregate view).
  let myQueueCount = 0;
  let myQueueLabel: string | null = null;
  if (hasAbility(liveSession, "scholarship_approve")) {
    const { count } = await db!.from("scholarships").select("id", { count: "exact", head: true }).eq("listing_status", "verified");
    myQueueCount = count ?? 0;
    myQueueLabel = "awaiting your approval";
  } else if (hasAbility(liveSession, "scholarship_verify")) {
    const { count } = await db!.from("scholarships").select("id", { count: "exact", head: true }).eq("listing_status", "to_be_verified");
    myQueueCount = count ?? 0;
    myQueueLabel = "awaiting your verification";
  }

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
      analyticsData={{
        payments: paymentsResult.data ?? [],
      }}
      staffList={staffList ?? []}
      scholarships={scholarships ?? []}
      accessClasses={accessClasses ?? []}
      accessPeriods={accessPeriods ?? []}
      accessClassPrices={accessClassPrices ?? []}
      reportData={reportData}
      myQueueCount={myQueueCount}
      myQueueLabel={myQueueLabel}
    />
  );
}
