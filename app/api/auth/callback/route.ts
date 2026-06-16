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

  const { data: existing } = await supabaseAdmin
    .from("client_profiles")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) return;

  const fullName = (user.user_metadata?.full_name as string | undefined) ?? user.email;

  const { error: insertError } = await supabaseAdmin.from("client_profiles").insert({
    user_id: user.id,
    full_name: fullName,
    email: user.email,
  } as Record<string, unknown>);

  if (insertError) {
    console.error("[auth/callback] Failed to create client_profiles row:", insertError);
    return;
  }

  try {
    await sendEmail({
      to: user.email,
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
