import { cookies } from "next/headers";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { decodeSession, hasAbility, STAFF_COOKIE_NAME, type AdminSession, type StaffAbility } from "@/lib/admin-auth";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * Gate for the staff portal's ability-based features (STAFF_COOKIE_NAME) —
 * the separate `/admin/*` area's admin_session cookie never carries
 * abilities (see app/api/admin/login/route.ts), so an ability check has no
 * home there. This is the first real consumer of `manage_scholarships`.
 *
 * Abilities are re-read from `staff_profiles` rather than trusted from the
 * cookie's snapshot — same reasoning as
 * app/staff/(portal)/dashboard/page.tsx's `liveSession`: a super_admin can
 * grant/revoke an ability without forcing the staff member to re-login.
 */
export async function requireStaffAbility(ability: StaffAbility): Promise<{
  session: AdminSession;
  adminClient: SupabaseClient;
}> {
  const cookieStore = await cookies();
  const token = cookieStore.get(STAFF_COOKIE_NAME)?.value;
  const session = token ? await decodeSession(token) : null;
  if (!session) throw new Error("Forbidden");

  const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  const { data: staff } = await adminClient
    .from("staff_profiles")
    .select("role, is_active, is_pending, abilities")
    .eq("id", session.userId)
    .maybeSingle();

  if (!staff || !staff.is_active || staff.is_pending) throw new Error("Forbidden");

  const liveSession: AdminSession = {
    ...session,
    role: staff.role,
    abilities: staff.abilities ?? {},
  };
  if (!hasAbility(liveSession, ability)) throw new Error("Forbidden");

  return { session: liveSession, adminClient };
}
