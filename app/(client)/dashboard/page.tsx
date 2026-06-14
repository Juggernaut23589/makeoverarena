import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { ClientDashboard } from "@/components/client/client-dashboard";
import Link from "next/link";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export default async function ClientDashboardPage() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("sb-access-token")?.value
    ?? cookieStore.get(`sb-${SUPABASE_URL.split("//")[1]?.split(".")[0]}-auth-token`)?.value;

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    return <UnconfiguredState />;
  }

  // Try to get session from cookie
  const anonClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  let userId: string | null = null;
  let userEmail: string | null = null;

  if (accessToken) {
    const { data } = await anonClient.auth.getUser(accessToken);
    userId = data.user?.id ?? null;
    userEmail = data.user?.email ?? null;
  }

  // If no session, show the unauthenticated state
  if (!userId || !userEmail) {
    return <UnauthenticatedState />;
  }

  const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  // Find client profile by user_id or email
  const { data: profile } = await adminClient
    .from("client_profiles")
    .select("*")
    .or(`user_id.eq.${userId},email.eq.${userEmail}`)
    .single<Record<string, unknown>>();

  if (!profile) {
    return <NoProfileState email={userEmail} />;
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

  // Link user_id to profile if not already set
  if (!profile.user_id) {
    await adminClient.from("client_profiles").update({ user_id: userId }).eq("id", clientId);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (
    <ClientDashboard
      profile={profile as unknown as Parameters<typeof ClientDashboard>[0]["profile"]}
      applications={(applicationsResult.data ?? []) as unknown as Parameters<typeof ClientDashboard>[0]["applications"]}
      payments={(paymentsResult.data ?? []) as unknown as Parameters<typeof ClientDashboard>[0]["payments"]}
      consultations={(consultationsResult.data ?? []) as unknown as Parameters<typeof ClientDashboard>[0]["consultations"]}
      documents={(documentsResult.data ?? []) as unknown as Parameters<typeof ClientDashboard>[0]["documents"]}
      clientId={clientId}
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

function UnauthenticatedState() {
  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        <div className="w-14 h-14 bg-gold-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <span className="font-display text-navy-900 font-bold text-2xl leading-none">M</span>
        </div>
        <h1 className="font-display text-3xl text-navy-900 mb-3">Client Dashboard</h1>
        <p className="text-navy-500 mb-8">
          Track your application progress, consultations, payments, and documents — all in one place.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/login"
            className="px-6 py-3 bg-navy-900 text-white rounded-xl font-semibold text-sm hover:bg-navy-800 transition-colors"
          >
            Sign In →
          </Link>
          <Link
            href="/apply"
            className="px-6 py-3 border border-navy-200 text-navy-700 rounded-xl font-semibold text-sm hover:bg-navy-50 transition-colors"
          >
            Start Application
          </Link>
        </div>
        <p className="text-navy-400 text-xs mt-6">
          New to MakeoverArena?{" "}
          <Link href="/signup" className="text-gold-600 hover:text-gold-700">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}

function NoProfileState({ email }: { email: string }) {
  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        <div className="w-14 h-14 bg-gold-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <span className="font-display text-navy-900 font-bold text-2xl leading-none">M</span>
        </div>
        <h1 className="font-display text-2xl text-navy-900 mb-3">Account Being Set Up</h1>
        <p className="text-navy-500 mb-3">
          Your account ({email}) is registered, but your client profile hasn&apos;t been activated yet.
        </p>
        <p className="text-navy-400 text-sm mb-8">
          Your advisor will activate your dashboard after your first consultation. This usually happens within 24 hours.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/book"
            className="px-6 py-3 bg-gold-500 text-navy-900 rounded-xl font-semibold text-sm hover:bg-gold-400 transition-colors"
          >
            Book Consultation →
          </Link>
          <a
            href="mailto:info@makeoverarena.com"
            className="px-6 py-3 border border-navy-200 text-navy-700 rounded-xl font-semibold text-sm hover:bg-navy-50 transition-colors"
          >
            Contact Advisor
          </a>
        </div>
      </div>
    </div>
  );
}
