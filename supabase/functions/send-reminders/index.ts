/**
 * send-reminders — Supabase Edge Function
 *
 * Schedule: every hour via Supabase cron
 * Trigger:  finds consultations scheduled in the next 24h or 1h
 * Action:   sends reminder emails via Resend, marks flags on consultation row
 *
 * Deploy:   supabase functions deploy send-reminders
 * Cron:     supabase functions schedule send-reminders --schedule "0 * * * *"
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

Deno.serve(async (_req) => {
  const now = new Date();

  // Window for 24hr reminders: consultations 23–25 hours from now
  const window24hStart = new Date(now.getTime() + 23 * 60 * 60 * 1000).toISOString();
  const window24hEnd = new Date(now.getTime() + 25 * 60 * 60 * 1000).toISOString();

  // Window for 1hr reminders: consultations 50–70 minutes from now
  const window1hStart = new Date(now.getTime() + 50 * 60 * 1000).toISOString();
  const window1hEnd = new Date(now.getTime() + 70 * 60 * 1000).toISOString();

  let sent = 0;

  try {
    // --- 24h reminders ---
    const { data: due24h } = await supabase
      .from("consultations")
      .select("id, student_name, student_email, scheduled_date, scheduled_time, timezone, meeting_link")
      .eq("status", "scheduled")
      .eq("reminder_24h_sent", false)
      .gte("scheduled_date", window24hStart.slice(0, 10))
      .lte("scheduled_date", window24hEnd.slice(0, 10))
      .limit(20);

    for (const c of due24h ?? []) {
      try {
        await sendReminder(c, "24h");
        await supabase
          .from("consultations")
          .update({ reminder_24h_sent: true })
          .eq("id", c.id);
        sent++;
      } catch (err) {
        console.error(`24h reminder failed for ${c.id}:`, err);
      }
    }

    // --- 1h reminders ---
    const { data: due1h } = await supabase
      .from("consultations")
      .select("id, student_name, student_email, scheduled_date, scheduled_time, timezone, meeting_link")
      .eq("status", "scheduled")
      .eq("reminder_1h_sent", false)
      .gte("scheduled_date", window1hStart.slice(0, 10))
      .lte("scheduled_date", window1hEnd.slice(0, 10))
      .limit(20);

    for (const c of due1h ?? []) {
      try {
        await sendReminder(c, "1h");
        await supabase
          .from("consultations")
          .update({ reminder_1h_sent: true })
          .eq("id", c.id);
        sent++;
      } catch (err) {
        console.error(`1h reminder failed for ${c.id}:`, err);
      }
    }

    return new Response(JSON.stringify({ sent }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("send-reminders error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});

async function sendReminder(
  consultation: {
    id: string;
    student_name: string;
    student_email: string;
    scheduled_date: string;
    scheduled_time: string;
    timezone: string;
    meeting_link: string | null;
  },
  type: "24h" | "1h"
) {
  const firstName = consultation.student_name.split(" ")[0];
  const is1h = type === "1h";
  const dateLabel = new Date(consultation.scheduled_date).toLocaleDateString("en-NG", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const subject = is1h
    ? `⏰ Your consultation starts in 1 hour — ${consultation.scheduled_time}`
    : `📅 Reminder: consultation tomorrow at ${consultation.scheduled_time}`;

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "MakeoverArena <noreply@makeoverarena.com>",
      to: [consultation.student_email],
      subject,
      html: buildReminderHtml(firstName, dateLabel, consultation.scheduled_time, consultation.timezone, consultation.meeting_link, is1h),
    }),
  });

  await supabase.from("email_logs").insert({
    recipient_email: consultation.student_email,
    subject,
    template_name: `consultation-reminder-${type}`,
    status: "sent",
    consultation_id: consultation.id,
  });
}

function buildReminderHtml(
  name: string,
  date: string,
  time: string,
  timezone: string,
  meetingLink: string | null,
  is1h: boolean
): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 580px; margin: 0 auto; background: #fff; border-radius: 12px; overflow: hidden;">
      <div style="background: #0A1628; padding: 24px; text-align: center;">
        <p style="color: #D4A853; font-size: 20px; font-weight: 700; margin: 0;">MakeoverArena</p>
      </div>
      <div style="padding: 32px 24px;">
        <h1 style="color: #0A1628; font-size: 22px; margin: 0 0 12px;">
          ${is1h ? "⏰ Starting in 1 hour" : "📅 Consultation Tomorrow"}
        </h1>
        <p style="color: #4B5563; font-size: 15px; line-height: 1.7; margin: 0 0 24px;">
          Hi ${name}, ${is1h ? "your consultation starts in about 1 hour." : "just a reminder about your consultation tomorrow."}
        </p>
        <div style="background: #0A1628; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
          <p style="color: #D4A853; font-size: 13px; font-weight: 600; margin: 0 0 4px;">${date}</p>
          <p style="color: #ffffff; font-size: 32px; font-weight: 700; margin: 0 0 8px; font-family: Georgia, serif;">${time}</p>
          <p style="color: rgba(255,255,255,0.5); font-size: 13px; margin: 0;">${timezone}</p>
        </div>
        ${meetingLink ? `
        <div style="text-align: center;">
          <a href="${meetingLink}"
             style="background: #D4A853; color: #0A1628; font-weight: 700; font-size: 14px; padding: 12px 28px; border-radius: 8px; text-decoration: none; display: inline-block;">
            Join Meeting →
          </a>
        </div>` : ""}
      </div>
      <div style="background: #F9FAFB; padding: 16px 24px; text-align: center;">
        <p style="color: #9CA3AF; font-size: 12px; margin: 0;">
          Need to reschedule? Reply to this email at least 4 hours before the call.
        </p>
      </div>
    </div>
  `;
}
