/**
 * send-followups — Supabase Edge Function
 *
 * Schedule: daily at 9:00 AM WAT via Supabase cron
 * Trigger:  finds inquiries where status = 'new' and created_at < NOW() - 48h
 * Action:   sends a 48hr follow-up email via Resend, updates status to 'reviewed'
 *
 * Deploy:   supabase functions deploy send-followups
 * Cron:     supabase functions schedule send-followups --schedule "0 8 * * *"
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

Deno.serve(async (_req) => {
  try {
    // Find inquiries older than 48 hours still with status 'new'
    const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();

    const { data: inquiries, error } = await supabase
      .from("inquiries")
      .select("id, full_name, email, service_type")
      .eq("status", "new")
      .lt("created_at", cutoff)
      .eq("opted_in_emails", true)
      .limit(50);

    if (error) throw error;
    if (!inquiries || inquiries.length === 0) {
      return new Response(JSON.stringify({ sent: 0, message: "No follow-ups needed" }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    let sent = 0;
    const results: { id: string; success: boolean }[] = [];

    for (const inquiry of inquiries) {
      try {
        const studentFirstName = inquiry.full_name.split(" ")[0];

        const emailRes = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "MakeoverArena <noreply@makeoverarena.com>",
            to: [inquiry.email],
            subject: `Still thinking about it, ${studentFirstName}? We'd love to help.`,
            html: buildFollowupHtml(studentFirstName, inquiry.service_type),
          }),
        });

        if (!emailRes.ok) throw new Error(await emailRes.text());

        // Log email
        await supabase.from("email_logs").insert({
          recipient_email: inquiry.email,
          subject: `Still thinking about it, ${studentFirstName}?`,
          template_name: "inquiry-followup",
          status: "sent",
          inquiry_id: inquiry.id,
        });

        // Update inquiry status so we don't double-send
        await supabase
          .from("inquiries")
          .update({ status: "reviewed" })
          .eq("id", inquiry.id);

        sent++;
        results.push({ id: inquiry.id, success: true });
      } catch (err) {
        console.error(`Follow-up failed for ${inquiry.id}:`, err);
        results.push({ id: inquiry.id, success: false });
      }
    }

    return new Response(JSON.stringify({ sent, total: inquiries.length, results }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("send-followups error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});

function buildFollowupHtml(name: string, service: string): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 580px; margin: 0 auto; background: #fff; border-radius: 12px; overflow: hidden;">
      <div style="background: #0A1628; padding: 24px; text-align: center;">
        <p style="color: #D4A853; font-size: 20px; font-weight: 700; margin: 0;">MakeoverArena</p>
      </div>
      <div style="padding: 32px 24px;">
        <h1 style="color: #0A1628; font-size: 22px; margin: 0 0 16px;">Still thinking about it, ${name}?</h1>
        <p style="color: #4B5563; font-size: 15px; line-height: 1.7; margin: 0 0 16px;">
          You submitted an application for <strong>${service}</strong> a couple of days ago.
          Our team has reviewed your profile and we believe we can genuinely help you.
        </p>
        <p style="color: #4B5563; font-size: 15px; line-height: 1.7; margin: 0 0 24px;">
          Book your free 30-minute consultation — no commitment, just a conversation about what's possible.
        </p>
        <div style="text-align: center;">
          <a href="https://makeoverarena.com/book"
             style="background: #D4A853; color: #0A1628; font-weight: 700; font-size: 14px; padding: 12px 28px; border-radius: 8px; text-decoration: none; display: inline-block;">
            Book Free Consultation →
          </a>
        </div>
      </div>
      <div style="background: #F9FAFB; padding: 16px 24px; text-align: center;">
        <p style="color: #9CA3AF; font-size: 12px; margin: 0;">
          © ${new Date().getFullYear()} MakeoverArena · Lagos, Nigeria
        </p>
      </div>
    </div>
  `;
}
