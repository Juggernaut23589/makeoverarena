import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "@/lib/supabase";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const EDITABLE_FIELDS = [
  "phone", "city", "country", "graduation_year", "field_of_study",
  "education_level", "preferred_countries", "service_type", "budget_range",
  "gpa", "gpa_scale", "is_pass_fail",
] as const;

export async function PATCH(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cookieHeader = request.headers.get("cookie") ?? "";

  // Extract access token from cookie (Supabase sets sb-*-auth-token)
  const tokenMatch = cookieHeader.match(/sb-[^=]+-auth-token=([^;]+)/);
  const accessToken = authHeader?.replace("Bearer ", "") ?? (tokenMatch ? decodeURIComponent(tokenMatch[1]) : null);

  if (!accessToken || !SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const anonClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const { data: { user } } = await anonClient.auth.getUser(accessToken);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json() as Record<string, unknown>;
  const update: Record<string, unknown> = {};
  for (const field of EDITABLE_FIELDS) {
    if (field in body) update[field] = body[field];
  }

  if (!supabaseAdmin || Object.keys(update).length === 0) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from("client_profiles")
    .update(update)
    .eq("user_id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
