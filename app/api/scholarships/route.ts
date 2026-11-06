import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// Allowlisted columns only — verified_by/created_by/last_checked_by are
// internal staff UUIDs (added for the admin verification workflow) that
// must never reach the browser.
const PUBLIC_COLUMNS =
  "id, name, description, destination_country, institution_name, programme_name, study_level, funding_type, eligibility_notes, amount, application_deadline, application_url, source_url, listing_status, min_gpa_4_scale, min_gpa_5_scale, is_active, created_at";

export async function GET(request: NextRequest) {
  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Not configured" }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const country = searchParams.get("country");
  const studyLevel = searchParams.get("study_level");
  const fundingType = searchParams.get("funding_type");
  const q = searchParams.get("q")?.trim();

  // Browse mode: every open/upcoming scholarship regardless of GPA, for the
  // dashboard's search/filter UI. Still always is_active=true — GPA-gating
  // below is a *different*, narrower default view, not a public-visibility
  // gate, and this mode never bypasses is_active.
  if (searchParams.get("mode") === "all") {
    let query = supabaseAdmin
      .from("scholarships")
      .select(PUBLIC_COLUMNS)
      .eq("is_active", true)
      .order("application_deadline", { ascending: true, nullsFirst: false });
    if (country) query = query.eq("destination_country", country);
    if (studyLevel) query = query.eq("study_level", studyLevel);
    if (fundingType) query = query.eq("funding_type", fundingType);
    if (q) query = query.or(`name.ilike.%${q}%,institution_name.ilike.%${q}%,programme_name.ilike.%${q}%`);
    const { data } = await query;
    return NextResponse.json({ kind: "scholarships", items: data ?? [] });
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
    return NextResponse.json({ kind: "scholarships", items: data ?? [] });
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
    .order("created_at", { ascending: false });
  if (country) query = query.eq("destination_country", country);
  if (studyLevel) query = query.eq("study_level", studyLevel);
  if (fundingType) query = query.eq("funding_type", fundingType);
  if (q) query = query.or(`name.ilike.%${q}%,institution_name.ilike.%${q}%,programme_name.ilike.%${q}%`);

  const { data } = await query;

  return NextResponse.json({ kind: "scholarships", items: data ?? [] });
}
