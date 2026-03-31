/**
 * handle-no-shows — Supabase Edge Function
 *
 * Schedule: daily at 11:00 PM WAT
 * Trigger:  finds scheduled consultations whose scheduled_date has passed
 * Action:   marks them as no_show, sends rescue email to student
 *
 * Deploy:   supabase functions deploy handle-no-shows
 * Cron:     supabase functions schedule handle-no-shows --schedule "0 22 * * *"
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

Deno.serve(async (_req) => {
  try {
    const today = new Date().toISOString().slice(0, 10);

    // Find scheduled consultations that should have happened by now (yesterday or earlier)
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10);

    const { data: overdue, error } = await supabase
      .from("consultations")
      .select("id, student_name, student_email, scheduled_date, scheduled_time")
      .eq("status", "scheduled")
      .lte("scheduled_date", yesterday)
      .limit(20);

    if (error) throw error;
    if (!overdue || overdue.length === 0) {
      return new Response(JSON.stringify({ updated: 0 }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    let updated = 0;

    for (const c of overdue) {
      try {
        // Mark as no_show
        await supabase
          .from("consultations")
          .update({ status: "no_show" })
          .eq("id", c.id);

        const firstName = c.student_name.split(" ")[0];

        // Send reschedule email
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "MakeoverArena <noreply@makeoverarena.com>",
            to: [c.student_email],
            subject: `We missed you, ${firstName} — let's reschedule`,
            html: buildNoShowHtml(firstName, c.scheduled_date, c.scheduled_time),
          }),
        });

        await supabase.from("email_logs").insert({
          recipient_email: c.student_email,
          subject: `We missed you, ${firstName} — let's reschedule`,
          template_name: "no-show-followup",
          status: "sent",
          consultation_id: c.id,
        });

        updated++;
      } catch (err) {
        console.error(`No-show handler failed for ${c.id}:`, err);
      }
    }

    return new Response(JSON.stringify({ updated }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("handle-no-shows error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});

function buildNoShowHtml(name: string, date: string, time: string): string {
  const dateLabel = new Date(date).toLocaleDateString("en-NG", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return `
    <div style="font-family: Arial, sans-serif; max-width: 580px; margin: 0 auto; background: #fff; border-radius: 12px; overflow: hidden;">
      <div style="background: #0A1628; padding: 24px; text-align: center;">
        <p style="color: #D4A853; font-size: 20px; font-weight: 700; margin: 0;">MakeoverArena</p>
      </div>
      <div style="padding: 32px 24px;">
        <h1 style="color: #0A1628; font-size: 22px; margin: 0 0 12px;">We missed you, ${name}</h1>
        <p style="color: #4B5563; font-size: 15px; line-height: 1.7; margin: 0 0 16px;">
          It looks like you weren't able to make it to your consultation on
          <strong>${dateLabel} at ${time}</strong>. No worries at all — life happens.
        </p>
        <p style="color: #4B5563; font-size: 15px; line-height: 1.7; margin: 0 0 24px;">
          We'd love to reschedule and get you back on track toward your study abroad goals.
          Just click below to pick a new time that works for you.
        </p>
        <div style="text-align: center;">
          <a href="https://makeoverarena.com/book"
             style="background: #D4A853; color: #0A1628; font-weight: 700; font-size: 14px; padding: 12px 28px; border-radius: 8px; text-decoration: none; display: inline-block;">
            Reschedule Now →
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
