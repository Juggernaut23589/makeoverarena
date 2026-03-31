import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabase as any;
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { inquiryId } = await request.json();

    // Check if client_profile already exists
    const { data: existing } = await db
      .from("client_profiles")
      .select("id")
      .eq("id", user.id)
      .single();

    if (existing) {
      return NextResponse.json({ success: true, alreadyExists: true });
    }

    // Fetch inquiry data to pre-populate profile
    const adminClient = await createAdminClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const admin = adminClient as any;
    const { data: inquiry } = await admin
      .from("inquiries")
      .select("*")
      .eq("id", inquiryId)
      .eq("email", user.email ?? "")
      .single();

    if (!inquiry) {
      // Create minimal profile without inquiry data
      await db.from("client_profiles").insert({
        id: user.id,
        full_name: user.email?.split("@")[0] ?? "User",
        email: user.email!,
      });
      return NextResponse.json({ success: true });
    }

    // Create profile from inquiry data
    await db.from("client_profiles").insert({
      id: user.id,
      inquiry_id: inquiry.id,
      full_name: inquiry.full_name,
      email: inquiry.email,
      phone: inquiry.phone ?? null,
      whatsapp: inquiry.whatsapp ?? null,
      city: inquiry.city ?? null,
      country: inquiry.country ?? null,
      education_level: inquiry.education_level ?? null,
      field_of_study: inquiry.field_of_study ?? null,
      gpa_percentage: inquiry.gpa_percentage ?? null,
      graduation_year: inquiry.graduation_year ?? null,
      preferred_countries: inquiry.preferred_countries ?? null,
      service_type: inquiry.service_type ?? null,
      budget_range: inquiry.budget_range ?? null,
    });

    // Update inquiry with the linked user
    await admin
      .from("inquiries")
      .update({ status: "contacted" })
      .eq("id", inquiry.id);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[client/setup]", err);
    return NextResponse.json({ error: "Setup failed" }, { status: 500 });
  }
}
