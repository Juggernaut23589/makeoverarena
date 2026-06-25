import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { decodeSession, COOKIE_NAME } from "@/lib/admin-auth";
import { supabaseAdmin } from "@/lib/supabase";


export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token || !await decodeSession(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!supabaseAdmin) return NextResponse.json({ error: "DB not configured" }, { status: 503 });

  const { data } = await supabaseAdmin
    .from("inquiries")
    .select("id, full_name, email, phone, service_type, education_level, preferred_countries, intake_period, budget_range, status, priority, referral_source, created_at")
    .order("created_at", { ascending: false });

  if (!data || data.length === 0) {
    return new NextResponse("No data", { status: 200 });
  }

  const headers = ["ID", "Name", "Email", "Phone", "Service", "Education", "Countries", "Intake", "Budget", "Status", "Priority", "Referral Source", "Date"];
  const rows = (data as Record<string, unknown>[]).map((r) => [
    r.id,
    r.full_name,
    r.email,
    r.phone,
    r.service_type,
    r.education_level,
    Array.isArray(r.preferred_countries) ? (r.preferred_countries as string[]).join("; ") : r.preferred_countries,
    r.intake_period,
    r.budget_range,
    r.status,
    r.priority,
    r.referral_source,
    new Date(r.created_at as string).toLocaleDateString("en-NG"),
  ].map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(","));

  const csv = [headers.join(","), ...rows].join("\n");

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="inquiries-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
