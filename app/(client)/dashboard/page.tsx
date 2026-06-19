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

  const [applicationsResult, paymentsResult, consultationsResult, documentsResult] = await Promise.all([
    adminClient
      .from("application_tracking")
      .select("*")
      .eq("client_id", clientId)
      .order("created_at", { ascending: false }),
    adminClient
      .from("payments")
      .select("*")
      .eq("client_id", clientId)
      .order("created_at", { ascending: false }),
    adminClient
      .from("consultations")
      .select("id, student_name, scheduled_date, scheduled_time, timezone, status, outcome, meeting_link")
      .eq("student_email", profile.email as string)
      .order("scheduled_date", { ascending: false }),
    adminClient
      .from("documents")
      .select("*")
      .eq("client_id", clientId)
      .order("created_at", { ascending: false }),
  ]);

  if (!profile.user_id) {
    await adminClient.from("client_profiles").update({ user_id: userId }).eq("id", clientId);
  }

  let agent: Record<string, unknown> | null = null;
  if (profile.assigned_staff_id) {
    const { data } = await adminClient
      .from("staff_profiles")
      .select("full_name, email, phone, whatsapp")
      .eq("id", profile.assigned_staff_id as string)
      .maybeSingle();
    agent = data ?? null;
  }

  return (
    <ClientDashboard
      profile={profile as unknown as Parameters<typeof ClientDashboard>[0]["profile"]}
      applications={(applicationsResult.data ?? []) as unknown as Parameters<typeof ClientDashboard>[0]["applications"]}
      payments={(paymentsResult.data ?? []) as unknown as Parameters<typeof ClientDashboard>[0]["payments"]}
      consultations={(consultationsResult.data ?? []) as unknown as Parameters<typeof ClientDashboard>[0]["consultations"]}
      documents={(documentsResult.data ?? []) as unknown as Parameters<typeof ClientDashboard>[0]["documents"]}
      clientId={clientId}
      agent={agent as unknown as Parameters<typeof ClientDashboard>[0]["agent"]}
      documentsCompleted={Boolean(profile.documents_completed)}
      consultationBooked={Boolean(profile.consultation_booked)}
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

