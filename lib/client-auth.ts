import { createSupabaseServerClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase";

export type ClientProfileAuth =
  | { ok: true; userId: string; email: string; clientId: string }
  | { ok: false; status: number; error: string };

/**
 * Resolves the logged-in client's own `client_profiles.id` from their
 * Supabase session cookie — never from a client_id the request body or
 * form data claims. Used by every client-facing API route that writes
 * data scoped to one client (document uploads, payment initiation), so
 * a client can only ever act on their own records.
 *
 * Looked up by user_id OR email, matching the same fallback the
 * dashboard page uses — a profile created from an inquiry before the
 * user had an account may not have user_id backfilled yet.
 */
export async function requireClientProfile(): Promise<ClientProfileAuth> {
  if (!supabaseAdmin) {
    return { ok: false, status: 503, error: "Not configured" };
  }

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) {
    return { ok: false, status: 401, error: "Unauthorized" };
  }

  const { data: profile } = await supabaseAdmin
    .from("client_profiles")
    .select("id")
    .or(`user_id.eq.${user.id},email.ilike.${user.email}`)
    .maybeSingle<{ id: string }>();

  if (!profile) {
    return { ok: false, status: 404, error: "Client profile not found" };
  }

  return { ok: true, userId: user.id, email: user.email, clientId: profile.id };
}
