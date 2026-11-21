import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// Allowlisted columns only — verified_by/created_by/last_checked_by are
// internal staff UUIDs (added for the admin verification workflow) that
// must never reach the browser. required_class_id is fine to expose — it's
// just a reference into the public access_classes table.
const PUBLIC_COLUMNS =
  "id, name, description, destination_country, institution_name, programme_name, study_level, funding_type, eligibility_notes, academic_qualifications, field_of_study, amount, application_deadline, application_url, source_url, listing_status, min_gpa_4_scale, min_gpa_5_scale, is_active, created_at, required_class_id, view_count";

/** Fire-and-forget — logging a search term must never slow down or block
 *  the actual search response. */
function logSearch(q: string | null | undefined) {
  if (!supabaseAdmin || !q) return;
  supabaseAdmin.from("scholarship_search_logs").insert({ query: q }).then(
    () => {},
    () => {}
  );
}

type GatedScholarship = { required_class_id: string | null };

export interface TierGateResult<T> {
  items: T[];
  /** How many matching scholarships exist but are hidden behind a tier the
   *  caller doesn't have — the upsell signal the whole tier system exists
   *  to create. Previously this was silently dropped; the caller never
   *  knew anything was hidden at all. */
  hiddenCount: number;
  /** The name of the cheapest tier that would unlock at least one more
   *  hidden item, or null if nothing is hidden / no upgrade would help. */
  nextTierName: string | null;
}

/**
 * Tier gating is independent of, and layered on top of, GPA gating —
 * both must pass. An anonymous or non-subscribed caller is rank 0, so only
 * required_class_id === null (free) scholarships ever show for them.
 * Classes are a handful of rows, so a single extra query plus an in-memory
 * filter is simpler and cheap enough to avoid denormalizing a rank column
 * onto every scholarship row.
 */
async function filterByAccessTier<T extends GatedScholarship>(items: T[]): Promise<TierGateResult<T>> {
  if (!supabaseAdmin || items.every((i) => i.required_class_id === null)) {
    return { items, hiddenCount: 0, nextTierName: null };
  }

  let callerRank = 0;
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.email) {
      const { data: profile } = await supabaseAdmin
        .from("client_profiles")
        .select("current_access_class_id, subscription_expires_at")
        .or(`user_id.eq.${user.id},email.ilike.${user.email}`)
        .maybeSingle<{ current_access_class_id: string | null; subscription_expires_at: string | null }>();

      if (profile?.current_access_class_id && profile.subscription_expires_at && new Date(profile.subscription_expires_at).getTime() > Date.now()) {
        const { data: cls } = await supabaseAdmin
          .from("access_classes")
          .select("rank")
          .eq("id", profile.current_access_class_id)
          .maybeSingle<{ rank: number }>();
        callerRank = cls?.rank ?? 0;
      }
    }
  } catch {
    // Anonymous/unauthenticated callers are simply free-tier — no error.
  }

  const { data: classes } = await supabaseAdmin.from("access_classes").select("id, name, rank").order("rank", { ascending: true });
  const classRows = classes ?? [];
  const rankMap = new Map(classRows.map((c: { id: string; rank: number }) => [c.id, c.rank]));

  const visible: T[] = [];
  let hiddenCount = 0;
  let cheapestHiddenRank: number | null = null;

  for (const item of items) {
    if (item.required_class_id === null) {
      visible.push(item);
      continue;
    }
    const requiredRank = rankMap.get(item.required_class_id);
    if (requiredRank !== undefined && requiredRank <= callerRank) {
      visible.push(item);
    } else {
      hiddenCount++;
      if (requiredRank !== undefined && (cheapestHiddenRank === null || requiredRank < cheapestHiddenRank)) {
        cheapestHiddenRank = requiredRank;
      }
    }
  }

  const nextTierName = cheapestHiddenRank !== null
    ? classRows.find((c: { rank: number }) => c.rank === cheapestHiddenRank)?.name ?? null
    : null;

  return { items: visible, hiddenCount, nextTierName };
}

export async function GET(request: NextRequest) {
  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Not configured" }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const country = searchParams.get("country");
  const studyLevel = searchParams.get("study_level");
  const fundingType = searchParams.get("funding_type");
  const institution = searchParams.get("institution")?.trim();
  const sort = searchParams.get("sort");
  const q = searchParams.get("q")?.trim();
  logSearch(q);

  const orderCol = sort === "newest" ? "created_at" : sort === "name" ? "name" : "application_deadline";
  const orderAsc = sort !== "newest";

  // Browse mode: every open/upcoming scholarship regardless of GPA, for the
  // dashboard's search/filter UI. Still always is_active=true — GPA-gating
  // below is a *different*, narrower default view, not a public-visibility
  // gate, and this mode never bypasses is_active.
  if (searchParams.get("mode") === "all") {
    let query = supabaseAdmin
      .from("scholarships")
      .select(PUBLIC_COLUMNS)
      .eq("is_active", true)
      .order(orderCol, { ascending: orderAsc, nullsFirst: false });
    if (country) query = query.eq("destination_country", country);
    if (studyLevel) query = query.eq("study_level", studyLevel);
    if (fundingType) query = query.eq("funding_type", fundingType);
    if (institution) query = query.ilike("institution_name", `%${institution}%`);
    if (q) query = query.or(`name.ilike.%${q}%,institution_name.ilike.%${q}%,programme_name.ilike.%${q}%`);
    const { data } = await query;
    const gated = await filterByAccessTier(data ?? []);
    return NextResponse.json({ kind: "scholarships", items: gated.items, hiddenCount: gated.hiddenCount, nextTierName: gated.nextTierName });
  }

  const gpaParam = searchParams.get("gpa");
  const scale = searchParams.get("gpa_scale");
  const isPassFail = searchParams.get("is_pass_fail") === "true";

  if (isPassFail) {
    const { data } = await supabaseAdmin
      .from("scholarships")
      .select(PUBLIC_COLUMNS)
      .eq("is_active", true)
      .order("created_at", { ascending: false });
    const gated = await filterByAccessTier(data ?? []);
    return NextResponse.json({ kind: "scholarships", items: gated.items, hiddenCount: gated.hiddenCount, nextTierName: gated.nextTierName });
  }

  const gpa = gpaParam ? parseFloat(gpaParam) : null;
  if (gpa === null || (scale !== "4.0" && scale !== "5.0")) {
    return NextResponse.json({ error: "gpa and gpa_scale (4.0 or 5.0) are required" }, { status: 400 });
  }

  const excluded = scale === "4.0" ? gpa <= 2.49 : gpa <= 2.79;

  if (excluded) {
    const { data } = await supabaseAdmin
      .from("low_tuition_packages")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false });
    return NextResponse.json({ kind: "low_tuition", items: data ?? [] });
  }

  const column = scale === "4.0" ? "min_gpa_4_scale" : "min_gpa_5_scale";
  let query = supabaseAdmin
    .from("scholarships")
    .select(PUBLIC_COLUMNS)
    .eq("is_active", true)
    .lte(column, gpa)
    .order(orderCol, { ascending: orderAsc, nullsFirst: false });
  if (country) query = query.eq("destination_country", country);
  if (studyLevel) query = query.eq("study_level", studyLevel);
  if (fundingType) query = query.eq("funding_type", fundingType);
  if (institution) query = query.ilike("institution_name", `%${institution}%`);
  if (q) query = query.or(`name.ilike.%${q}%,institution_name.ilike.%${q}%,programme_name.ilike.%${q}%`);

  const { data } = await query;

  const gated = await filterByAccessTier(data ?? []);
  return NextResponse.json({ kind: "scholarships", items: gated.items, hiddenCount: gated.hiddenCount, nextTierName: gated.nextTierName });
}
