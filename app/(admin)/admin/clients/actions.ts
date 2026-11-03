"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/app/(admin)/admin/login/actions";
import { sendEmail } from "@/lib/emails/send-email";
import PaymentConfirmation from "@/emails/payment-confirmation";
import PaymentRequest from "@/emails/payment-request";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

async function requireSuperAdmin() {
  const session = await getAdminSession();
  if (!session || session.role !== "super_admin") throw new Error("Forbidden");
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
}

// Agent assignment stays super_admin-only (unchanged); viewing a client and
// raising a payment is an everyday admin task, so this is the wider check
// the client detail page and invoice creation use instead.
async function requireAdmin() {
  const session = await getAdminSession();
  if (!session || !["super_admin", "admin"].includes(session.role)) throw new Error("Forbidden");
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
}

export type CreateInvoiceResult = { error?: string; success?: boolean };

/**
 * The only way a `payments` row is ever created now — previously the
 * client-facing /api/payments/initiate endpoint would insert one from
 * whatever amount the browser sent. That path was removed (see
 * lib/client-auth.ts and api/payments/initiate/route.ts); a client can now
 * only pay an invoice a staff member raised here.
 */
export async function createInvoiceAction(formData: FormData): Promise<CreateInvoiceResult> {
  try {
    const adminClient = await requireAdmin();
    const clientId = (formData.get("clientId") as string) ?? "";
    const description = ((formData.get("description") as string) ?? "").trim();
    const amountRaw = (formData.get("amount") as string) ?? "";
    const amount = Number(amountRaw);

    if (!clientId) return { error: "Missing client." };
    if (!description) return { error: "Enter a description." };
    if (!amountRaw || !Number.isFinite(amount) || amount <= 0) {
      return { error: "Enter a valid amount greater than 0." };
    }

    const { data: client, error: clientError } = await adminClient
      .from("client_profiles")
      .select("full_name, email")
      .eq("id", clientId)
      .maybeSingle<{ full_name: string; email: string }>();

    if (clientError || !client) return { error: "Client not found." };

    const { error: insertError } = await adminClient.from("payments").insert({
      client_id: clientId,
      amount,
      currency: "NGN",
      status: "pending",
      description,
    });

    if (insertError) return { error: insertError.message };

    try {
      await sendEmail({
        to: client.email,
        subject: `Payment requested — ${description}`,
        templateName: "payment-request",
        react: PaymentRequest({
          studentName: client.full_name,
          amount,
          currency: "NGN",
          description,
        }),
      });
    } catch (err) {
      // The invoice exists either way — a client can still see and pay it
      // from their dashboard even if the notification email failed.
      console.error("[createInvoiceAction] Failed to send payment-request email:", err);
    }

    revalidatePath(`/admin/clients/${clientId}`);
    return { success: true };
  } catch {
    return { error: "Forbidden." };
  }
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
