import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { fullInquirySchema } from "@/lib/validations/inquiry-schema";
import { sendEmail, ADMIN_EMAIL } from "@/lib/emails/send-email";
import { checkInquiryLimit, getIp } from "@/lib/rate-limit";
import InquiryConfirmation from "@/emails/inquiry-confirmation";
import AdminNotification from "@/emails/admin-notification";
import * as React from "react";

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = getIp(request);
    const { allowed, remaining } = await checkInquiryLimit(ip);
    if (!allowed) {
      return NextResponse.json(
        { error: "Too many submissions. Please try again later." },
        {
          status: 429,
          headers: { "X-RateLimit-Remaining": String(remaining) },
        }
      );
    }

    const body = await request.json();

    // Server-side validation
    const parsed = fullInquirySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid form data", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Capture UTM params
    const utm_source = request.nextUrl.searchParams.get("utm_source") ?? undefined;
    const utm_medium = request.nextUrl.searchParams.get("utm_medium") ?? undefined;
    const utm_campaign = request.nextUrl.searchParams.get("utm_campaign") ?? undefined;

    const supabase = await createAdminClient();

    const { data: inquiry, error } = await supabase
      .from("inquiries")
      .insert({
        full_name: data.full_name,
        email: data.email,
        phone: data.phone,
        whatsapp: data.whatsapp || null,
        city: data.city,
        country: data.country,
        service_type: data.service_type,
        education_level: data.education_level,
        field_of_study: data.field_of_study || null,
        gpa_percentage: data.gpa_percentage ?? null,
        graduation_year: data.graduation_year ?? null,
        preferred_countries: data.preferred_countries,
        intake_period: data.intake_period,
        budget_range: data.budget_range,
        tests_taken: data.tests_taken || [],
        test_scores: data.test_scores || null,
        referral_source: data.referral_source,
        referrer_name: data.referrer_name || null,
        additional_notes: data.additional_notes || null,
        opted_in_emails: data.opted_in_emails,
        status: "new",
        priority: "medium",
        utm_source: utm_source || null,
        utm_medium: utm_medium || null,
        utm_campaign: utm_campaign || null,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any)
      .select("id")
      .single<{ id: string }>();

    if (error) {
      console.error("Supabase insert error:", error.message);
      return NextResponse.json(
        { error: "Failed to save inquiry" },
        { status: 500 }
      );
    }

    // Send emails in parallel (non-blocking — don't fail the response if email fails)
    void Promise.allSettled([
      // Confirmation to student
      sendEmail({
        to: data.email,
        subject: "Application received — MakeoverArena",
        react: React.createElement(InquiryConfirmation, {
          studentName: data.full_name.split(" ")[0],
          serviceType: data.service_type,
          preferredCountries: data.preferred_countries,
          intakePeriod: data.intake_period,
        }),
        inquiryId: inquiry.id,
        templateName: "inquiry-confirmation",
      }),
      // Admin notification
      sendEmail({
        to: ADMIN_EMAIL,
        subject: `New inquiry: ${data.full_name} — ${data.service_type}`,
        react: React.createElement(AdminNotification, {
          studentName: data.full_name,
          email: data.email,
          phone: data.phone,
          serviceType: data.service_type,
          preferredCountries: data.preferred_countries,
          budgetRange: data.budget_range,
          educationLevel: data.education_level,
          referralSource: data.referral_source,
          inquiryId: inquiry.id,
        }),
        inquiryId: inquiry.id,
        templateName: "admin-notification",
      }),
    ]);

    return NextResponse.json({ success: true, id: inquiry.id }, { status: 201 });
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
