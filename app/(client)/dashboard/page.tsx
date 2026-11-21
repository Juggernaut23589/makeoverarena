import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ClientDashboard } from "@/components/client/client-dashboard";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export default async function ClientDashboardPage() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    return <UnconfiguredState />;
  }

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/dashboard");
  }

  const userId = user.id;
  const userEmail = user.email!;

  const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  let { data: profile } = await adminClient
    .from("client_profiles")
    .select("*")
    .or(`user_id.eq.${userId},email.ilike.${userEmail}`)
    .maybeSingle<Record<string, unknown>>();

  const normalizedEmail = userEmail.toLowerCase();
  const fullName = (user.user_metadata?.full_name as string | undefined) ?? normalizedEmail.split("@")[0];

  const { data: inquiry } = await adminClient
    .from("inquiries")
    .select("*")
    .ilike("email", normalizedEmail)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle<Record<string, unknown>>();

  const buildProfileData = (extra: Record<string, unknown> = {}) => {
    const data: Record<string, unknown> = {
      user_id: userId,
      full_name: fullName,
      email: normalizedEmail,
      ...extra,
    };

    if (inquiry) {
      const fieldMapping: Record<string, string> = {
        phone: "phone",
        city: "city",
        country: "country",
        service_type: "service_type",
        education_level: "education_level",
        field_of_study: "field_of_study",
        gpa: "gpa",
        gpa_scale: "gpa_scale",
        is_pass_fail: "is_pass_fail",
        gpa_percentage: "gpa_percentage",
        graduation_year: "graduation_year",
        preferred_countries: "preferred_countries",
        budget_range: "budget_range",
      };

      for (const [inquiryField, profileField] of Object.entries(fieldMapping)) {
        if (inquiry[inquiryField] !== undefined && inquiry[inquiryField] !== null) {
          data[profileField] = inquiry[inquiryField];
        }
      }

      data.inquiry_id = inquiry.id;
    }

    return data;
  };

  // Auto-create profile for new signups so they land directly on the dashboard
  if (!profile) {
    const { data: created } = await adminClient
      .from("client_profiles")
      .insert(buildProfileData())
      .select("*")
      .single<Record<string, unknown>>();
    profile = created;
  } else if (inquiry && !profile.inquiry_id) {
    // Backfill inquiry data for existing profiles that were created before bridging
    const updates = buildProfileData();
    delete updates.id;
    await adminClient.from("client_profiles").update(updates).eq("id", profile.id as string);
    profile = { ...profile, ...updates };
  }

  if (!profile) {
    return <UnconfiguredState />;
  }

  const clientId = profile.id as string;

  const [paymentsResult, accessClassesResult, accessPeriodsResult, accessClassPricesResult, savedScholarshipsResult, scholarshipTierCountsResult] = await Promise.all([
    adminClient
      .from("payments")
      .select("*")
      .eq("client_id", clientId)
      .order("created_at", { ascending: false }),
    adminClient.from("access_classes").select("id, name, slug, rank, description").eq("is_active", true).order("rank", { ascending: true }),
    adminClient.from("access_periods").select("id, label, duration_days, display_order").eq("is_active", true).order("display_order", { ascending: true }),
    adminClient.from("access_class_prices").select("class_id, period_id, price_naira"),
    adminClient.from("saved_scholarships").select("scholarship_id").eq("client_id", clientId),
    adminClient.from("scholarships").select("required_class_id").eq("is_active", true),
  ]);

  if (!profile.user_id) {
    await adminClient.from("client_profiles").update({ user_id: userId }).eq("id", clientId);
  }

  // Cumulative per-tier scholarship counts — hierarchical, so a tier's
  // count includes everything free plus everything at or below its own
  // rank, matching the actual access-check logic in /api/scholarships.
  const sortedClasses = [...(accessClassesResult.data ?? [])].sort((a, b) => a.rank - b.rank);
  const freeCount = (scholarshipTierCountsResult.data ?? []).filter((s) => s.required_class_id === null).length;
  const countByClassId: Record<string, number> = {};
  let runningCount = freeCount;
  for (const cls of sortedClasses) {
    const ownCount = (scholarshipTierCountsResult.data ?? []).filter((s) => s.required_class_id === cls.id).length;
    runningCount += ownCount;
    countByClassId[cls.id] = runningCount;
  }

  return (
    <ClientDashboard
      profile={profile as unknown as Parameters<typeof ClientDashboard>[0]["profile"]}
      payments={(paymentsResult.data ?? []) as unknown as Parameters<typeof ClientDashboard>[0]["payments"]}
      accessClasses={accessClassesResult.data ?? []}
      accessPeriods={accessPeriodsResult.data ?? []}
      accessClassPrices={accessClassPricesResult.data ?? []}
      savedScholarshipIds={(savedScholarshipsResult.data ?? []).map((r) => r.scholarship_id as string)}
      scholarshipCountByClassId={countByClassId}
      freeScholarshipCount={freeCount}
    />
  );
}

function UnconfiguredState() {
  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        <p className="text-navy-500 text-sm">Service temporarily unavailable.</p>
      </div>
    </div>
  );
}

