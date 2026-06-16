"use server";

import { createClient } from "@supabase/supabase-js";
import { getAdminSession } from "@/app/(admin)/admin/login/actions";
import { sendEmail } from "@/lib/emails/send-email";
import PaymentConfirmation from "@/emails/payment-confirmation";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

async function requireSuperAdmin() {
  const session = await getAdminSession();
  if (!session || session.role !== "super_admin") throw new Error("Forbidden");
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
}

export async function assignAgentAction(formData: FormData): Promise<{ error?: string }> {
  try {
    const adminClient = await requireSuperAdmin();
    const clientId = (formData.get("clientId") as string) ?? "";
    const agentId = (formData.get("agentId") as string) ?? "";

    if (!clientId || !agentId) return { error: "Missing client or agent." };

    const { data: agent, error: agentError } = await adminClient
      .from("staff_profiles")
      .select("full_name, email, phone, whatsapp")
      .eq("id", agentId)
      .maybeSingle<{ full_name: string; email: string; phone: string | null; whatsapp: string | null }>();

    if (agentError || !agent) return { error: "Agent not found." };

    const { data: client, error: updateError } = await adminClient
      .from("client_profiles")
      .update({ assigned_staff_id: agentId, assigned_staff_name: agent.full_name })
      .eq("id", clientId)
      .select("full_name, email, payment_status")
      .single<{ full_name: string; email: string; payment_status: string }>();

    if (updateError || !client) return { error: updateError?.message ?? "Client not found." };

    // If the client has already paid, send the agent contact details now
    // (the initial payment-confirmation email is sent at payment time if an agent already exists).
    if (client.payment_status === "paid" || client.payment_status === "partial") {
      try {
        await sendEmail({
          to: client.email,
          subject: "Your MakeoverArena agent has been assigned",
          templateName: "payment-confirmation",
          react: PaymentConfirmation({
            studentName: client.full_name,
            amount: 0,
            currency: "NGN",
            description: "Your application",
            agentName: agent.full_name,
            agentEmail: agent.email,
            agentPhone: agent.phone,
            agentWhatsapp: agent.whatsapp,
            agentOnly: true,
          }),
        });
      } catch (err) {
        console.error("[assignAgentAction] Failed to send agent contact email:", err);
      }
    }

    return {};
  } catch {
    return { error: "Forbidden." };
  }
}
