import { supabaseAdmin } from "@/lib/supabase";
import { sendEmail } from "@/lib/emails/send-email";
import NewScholarshipMatch from "@/emails/new-scholarship-match";
import { APP_URL } from "@/lib/site-url";

/**
 * Fires once, right after a scholarship is approved & published
 * (approveAndPublishScholarship). Finds clients whose GPA and tier access
 * qualify them for this specific scholarship, and emails each one — a
 * WhatsApp send should be added here too once a Meta-approved message
 * template exists for this trigger (free-form WhatsApp text only delivers
 * within a 24h customer-service window, so it can't be added safely yet).
 *
 * Dedup via scholarship_match_notifications: a unique (client_id,
 * scholarship_id) row means this exact pair is never notified twice, even
 * if the listing is edited again later.
 */
export async function notifyMatchingClients(scholarshipId: string): Promise<void> {
  if (!supabaseAdmin) return;

  const { data: scholarship } = await supabaseAdmin
    .from("scholarships")
    .select("name, institution_name, destination_country, application_deadline, min_gpa_4_scale, min_gpa_5_scale, required_class_id")
    .eq("id", scholarshipId)
    .maybeSingle<{
      name: string;
      institution_name: string | null;
      destination_country: string | null;
      application_deadline: string | null;
      min_gpa_4_scale: number;
      min_gpa_5_scale: number;
      required_class_id: string | null;
    }>();
  if (!scholarship) return;

  let requiredRank = 0;
  if (scholarship.required_class_id) {
    const { data: cls } = await supabaseAdmin
      .from("access_classes")
      .select("rank")
      .eq("id", scholarship.required_class_id)
      .maybeSingle<{ rank: number }>();
    requiredRank = cls?.rank ?? 0;
  }

  const { data: clients } = await supabaseAdmin
    .from("client_profiles")
    .select("id, full_name, email, gpa, gpa_scale, is_pass_fail, current_access_class_id, subscription_expires_at")
    .not("email", "is", null);
  if (!clients || clients.length === 0) return;

  const classIds = [...new Set(clients.map((c) => c.current_access_class_id).filter(Boolean))] as string[];
  const rankMap = new Map<string, number>();
  if (classIds.length > 0) {
    const { data: classes } = await supabaseAdmin.from("access_classes").select("id, rank").in("id", classIds);
    for (const c of classes ?? []) rankMap.set(c.id, c.rank);
  }

  const eligible = clients.filter((c) => {
    if (scholarship.required_class_id) {
      const active = c.current_access_class_id && c.subscription_expires_at && new Date(c.subscription_expires_at).getTime() > Date.now();
      const clientRank = active ? rankMap.get(c.current_access_class_id!) ?? 0 : 0;
      if (clientRank < requiredRank) return false;
    }
    if (c.is_pass_fail) return true;
    if (c.gpa === null || !c.gpa_scale) return false;
    const threshold = c.gpa_scale === "4.0" ? scholarship.min_gpa_4_scale : scholarship.min_gpa_5_scale;
    return c.gpa >= threshold;
  });
  if (eligible.length === 0) return;

  const { data: alreadyNotified } = await supabaseAdmin
    .from("scholarship_match_notifications")
    .select("client_id")
    .eq("scholarship_id", scholarshipId);
  const notifiedSet = new Set((alreadyNotified ?? []).map((r) => r.client_id));

  for (const client of eligible) {
    if (notifiedSet.has(client.id) || !client.email) continue;
    try {
      await sendEmail({
        to: client.email,
        subject: `New scholarship match: ${scholarship.name}`,
        templateName: "new-scholarship-match",
        react: NewScholarshipMatch({
          studentName: client.full_name,
          scholarshipName: scholarship.name,
          institutionName: scholarship.institution_name,
          destinationCountry: scholarship.destination_country,
          applicationDeadline: scholarship.application_deadline,
          dashboardUrl: `${APP_URL}/dashboard`,
        }),
      });
      await supabaseAdmin.from("scholarship_match_notifications").insert({
        client_id: client.id,
        scholarship_id: scholarshipId,
      });
    } catch (err) {
      console.error(`new-scholarship-match email failed for client ${client.id}:`, err);
    }
  }
}
