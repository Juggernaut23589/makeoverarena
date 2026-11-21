import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { sendEmail } from "@/lib/emails/send-email";
import RenewalReminder from "@/emails/renewal-reminder";
import SubscriptionExpired from "@/emails/subscription-expired";
import { APP_URL } from "@/lib/site-url";

const CRON_SECRET = process.env.CRON_SECRET ?? "";

/**
 * Time-based subscription notices — renewal reminders (7d/1d before expiry)
 * and the expiry notice itself. Invoked by a VM crontab entry (documented in
 * the deploy notes), not a Supabase Edge Function, so it can reuse
 * sendEmail() and the real React Email templates instead of duplicating
 * HTML. Protected by a shared-secret bearer header, same pattern as the
 * sibling MobileTechJoint project's cron-protected routes.
 *
 * Idempotent per client per notice type via the *_sent_at columns on
 * client_profiles — same "time window + null-flag" pattern as the existing
 * send-reminders Supabase Edge Function, just reimplemented here so it can
 * use the shared email infra.
 */
export async function POST(request: NextRequest) {
  const auth = request.headers.get("authorization");
  if (!CRON_SECRET || auth !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Not configured" }, { status: 503 });
  }

  const now = Date.now();
  const DAY = 86_400_000;
  let sent7d = 0;
  let sent1d = 0;
  let sentExpired = 0;

  type DueClient = {
    id: string;
    full_name: string;
    email: string;
    subscription_expires_at: string;
    current_access_class_id: string | null;
  };

  const { data: classes } = await supabaseAdmin.from("access_classes").select("id, name");
  const classNameById = new Map((classes ?? []).map((c) => [c.id, c.name]));

  // 7-day reminder: expires 6.5–7.5 days from now, not yet sent.
  {
    const start = new Date(now + 6.5 * DAY).toISOString();
    const end = new Date(now + 7.5 * DAY).toISOString();
    const { data: due } = await supabaseAdmin
      .from("client_profiles")
      .select("id, full_name, email, subscription_expires_at, current_access_class_id")
      .gte("subscription_expires_at", start)
      .lte("subscription_expires_at", end)
      .is("renewal_reminder_7d_sent_at", null);

    for (const client of (due ?? []) as DueClient[]) {
      try {
        await sendEmail({
          to: client.email,
          subject: "Your scholarship database access expires in 7 days",
          templateName: "renewal-reminder",
          react: RenewalReminder({
            studentName: client.full_name,
            className: classNameById.get(client.current_access_class_id ?? "") ?? "your plan",
            daysLeft: 7,
            plansUrl: `${APP_URL}/dashboard`,
          }),
        });
        await supabaseAdmin.from("client_profiles").update({ renewal_reminder_7d_sent_at: new Date().toISOString() }).eq("id", client.id);
        sent7d++;
      } catch (err) {
        console.error(`7d renewal reminder failed for client ${client.id}:`, err);
      }
    }
  }

  // 1-day reminder: expires 0.5–1.5 days from now, not yet sent.
  {
    const start = new Date(now + 0.5 * DAY).toISOString();
    const end = new Date(now + 1.5 * DAY).toISOString();
    const { data: due } = await supabaseAdmin
      .from("client_profiles")
      .select("id, full_name, email, subscription_expires_at, current_access_class_id")
      .gte("subscription_expires_at", start)
      .lte("subscription_expires_at", end)
      .is("renewal_reminder_1d_sent_at", null);

    for (const client of (due ?? []) as DueClient[]) {
      try {
        await sendEmail({
          to: client.email,
          subject: "Your scholarship database access expires tomorrow",
          templateName: "renewal-reminder",
          react: RenewalReminder({
            studentName: client.full_name,
            className: classNameById.get(client.current_access_class_id ?? "") ?? "your plan",
            daysLeft: 1,
            plansUrl: `${APP_URL}/dashboard`,
          }),
        });
        await supabaseAdmin.from("client_profiles").update({ renewal_reminder_1d_sent_at: new Date().toISOString() }).eq("id", client.id);
        sent1d++;
      } catch (err) {
        console.error(`1d renewal reminder failed for client ${client.id}:`, err);
      }
    }
  }

  // Expiry notice: expired within the last 25 hours (covers a once-daily
  // cron run with margin), not yet sent.
  {
    const start = new Date(now - 25 * 60 * 60 * 1000).toISOString();
    const end = new Date(now).toISOString();
    const { data: due } = await supabaseAdmin
      .from("client_profiles")
      .select("id, full_name, email, subscription_expires_at, current_access_class_id")
      .gte("subscription_expires_at", start)
      .lte("subscription_expires_at", end)
      .is("expiry_notice_sent_at", null);

    for (const client of (due ?? []) as DueClient[]) {
      try {
        await sendEmail({
          to: client.email,
          subject: "Your scholarship database access has expired",
          templateName: "subscription-expired",
          react: SubscriptionExpired({
            studentName: client.full_name,
            className: classNameById.get(client.current_access_class_id ?? "") ?? "your plan",
            plansUrl: `${APP_URL}/dashboard`,
          }),
        });
        await supabaseAdmin.from("client_profiles").update({ expiry_notice_sent_at: new Date().toISOString() }).eq("id", client.id);
        sentExpired++;
      } catch (err) {
        console.error(`expiry notice failed for client ${client.id}:`, err);
      }
    }
  }

  return NextResponse.json({ sent7d, sent1d, sentExpired });
}
