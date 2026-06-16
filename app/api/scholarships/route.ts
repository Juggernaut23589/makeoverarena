import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Not configured" }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const gpaParam = searchParams.get("gpa");
  const scale = searchParams.get("gpa_scale");
  const isPassFail = searchParams.get("is_pass_fail") === "true";

  if (isPassFail) {
    const { data } = await supabaseAdmin
      .from("scholarships")
      .select("*")
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
  const { data } = await supabaseAdmin
    .from("scholarships")
    .select("*")
    .eq("is_active", true)
    .lte(column, gpa)
    .order("created_at", { ascending: false });

  return NextResponse.json({ kind: "scholarships", items: data ?? [] });
}
