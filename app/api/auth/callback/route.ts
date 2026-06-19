import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { supabaseAdmin } from "@/lib/supabase";
import { sendEmail } from "@/lib/emails/send-email";
import SignupConfirmation from "@/emails/signup-confirmation";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          },
        },
      }
    );

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      if (next === "/dashboard" && data.user) {
        await provisionClientProfile(data.user, origin);
      }
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}

async function provisionClientProfile(
  user: { id: string; email?: string; user_metadata?: Record<string, unknown> },
  origin: string
) {
  if (!supabaseAdmin || !user.email) return;

  const userEmail = user.email.toLowerCase();

  const { data: inquiry } = await supabaseAdmin
    .from("inquiries")
    .select("*")
    .ilike("email", userEmail)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle<Record<string, unknown>>();

  const fullName = (user.user_metadata?.full_name as string | undefined) ?? userEmail;

  const profileData: Record<string, unknown> = {
    user_id: user.id,
    full_name: fullName,
    email: userEmail,
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
        profileData[profileField] = inquiry[inquiryField];
      }
    }

    profileData.inquiry_id = inquiry.id;
  }

  const { data: existing } = await supabaseAdmin
    .from("client_profiles")
    .select("id, inquiry_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) {
    if (inquiry && !existing.inquiry_id) {
      await supabaseAdmin.from("client_profiles").update(profileData).eq("id", existing.id);
    }
    return;
  }

  const { error: insertError } = await supabaseAdmin.from("client_profiles").insert(profileData);

  if (insertError) {
    console.error("[auth/callback] Failed to create client_profiles row:", insertError);
    return;
  }

  try {
    await sendEmail({
      to: userEmail,
      subject: "Your MakeoverArena dashboard is ready",
      templateName: "signup-confirmation",
      react: SignupConfirmation({
        studentName: fullName,
        dashboardUrl: `${origin}/dashboard`,
      }),
    });
  } catch (err) {
    console.error("[auth/callback] Failed to send signup confirmation email:", err);
  }
}
