import { supabaseAdmin } from "@/lib/supabase";
import { sendEmail } from "@/lib/emails/send-email";
import PaymentConfirmation from "@/emails/payment-confirmation";

/**
 * Marking a payment paid happens on two independent paths:
 *
 *   1. POST /api/webhooks/paystack   — Paystack calls us (authoritative, retried)
 *   2. GET  /api/payments/verify     — the callback page calls us when the
 *                                      customer's browser comes back
 *
 * Either can arrive first, both can arrive, and Paystack retries webhooks — so
 * this has to be safe to run repeatedly for one reference. The UPDATE below is
 * the lock: `.neq("status", "paid")` means only the first caller to flip the row
 * gets rows back, and only that caller sends the receipt. Everyone else sees
 * zero rows and returns `alreadySettled`.
 *
 * Previously the receipt was sent only from the webhook, so a missed delivery
 * plus a returning browser marked the payment paid with no email to the customer.
 */

export type SettleResult = {
  settled: boolean;
  alreadySettled: boolean;
  reason?: "no-db" | "no-matching-row";
};

type ClaimedRow = {
  id: string;
  client_id: string | null;
  description: string | null;
  amount: number | null;
};

export async function settleSuccessfulPayment(input: {
  reference: string;
  paidAt: string;
  /** Paystack reports minor units (kobo). */
  amountKobo: number;
  currency: string;
  clientId?: string | null;
  description?: string | null;
  source: "webhook" | "verify";
}): Promise<SettleResult> {
  if (!supabaseAdmin) return { settled: false, alreadySettled: false, reason: "no-db" };

  const { data: claimed, error } = await supabaseAdmin
    .from("payments")
    .update({ status: "paid", paid_at: input.paidAt })
    .eq("paystack_reference", input.reference)
    .neq("status", "paid")
    .select("id, client_id, description, amount");

  if (error) {
    console.error(`[payments:${input.source}] claim failed for ${input.reference}:`, error);
    return { settled: false, alreadySettled: false, reason: "no-matching-row" };
  }

  const rows = (claimed ?? []) as ClaimedRow[];
  if (rows.length === 0) {
    // Already paid by the other path, or no row carries this reference.
    return { settled: false, alreadySettled: true };
  }

  const clientId = input.clientId ?? rows[0].client_id;
  if (clientId) {
    await refreshClientPaymentStatus(clientId);
    await sendPaymentConfirmation({
      clientId,
      amount: input.amountKobo / 100,
      currency: input.currency,
      description: input.description ?? rows[0].description ?? "Application Fee",
      source: input.source,
    });
  }

  return { settled: true, alreadySettled: false };
}

/** Mark a reference failed, but never downgrade one that is already paid. */
export async function markPaymentFailed(reference: string): Promise<void> {
  if (!supabaseAdmin) return;
  await supabaseAdmin
    .from("payments")
    .update({ status: "failed", paid_at: null })
    .eq("paystack_reference", reference)
    .neq("status", "paid");
}

async function refreshClientPaymentStatus(clientId: string): Promise<void> {
  if (!supabaseAdmin) return;

  const { data: payments } = await supabaseAdmin
    .from("payments")
    .select("status")
    .eq("client_id", clientId);

  const rows = payments ?? [];
  if (rows.length === 0) return;

  const allPaid = rows.every((p) => p.status === "paid");
  const anyPaid = rows.some((p) => p.status === "paid");

  await supabaseAdmin
    .from("client_profiles")
    .update({ payment_status: allPaid ? "paid" : anyPaid ? "partial" : "pending" })
    .eq("id", clientId);
}

async function sendPaymentConfirmation(params: {
  clientId: string;
  amount: number;
  currency: string;
  description: string;
  source: "webhook" | "verify";
}): Promise<void> {
  if (!supabaseAdmin) return;

  const { data: client } = await supabaseAdmin
    .from("client_profiles")
    .select("full_name, email, assigned_staff_id")
    .eq("id", params.clientId)
    .maybeSingle<{ full_name: string; email: string; assigned_staff_id: string | null }>();

  if (!client?.email) return;

  let agent: { full_name: string; email: string; phone: string | null; whatsapp: string | null } | null = null;
  if (client.assigned_staff_id) {
    const { data: staff } = await supabaseAdmin
      .from("staff_profiles")
      .select("full_name, email, phone, whatsapp")
      .eq("id", client.assigned_staff_id)
      .maybeSingle<{ full_name: string; email: string; phone: string | null; whatsapp: string | null }>();
    agent = staff ?? null;
  }

  try {
    await sendEmail({
      to: client.email,
      subject: "Payment received — MakeoverArena",
      templateName: "payment-confirmation",
      react: PaymentConfirmation({
        studentName: client.full_name,
        amount: params.amount,
        currency: params.currency,
        description: params.description,
        agentName: agent?.full_name ?? null,
        agentEmail: agent?.email ?? null,
        agentPhone: agent?.phone ?? null,
        agentWhatsapp: agent?.whatsapp ?? null,
      }),
    });
  } catch (err) {
    console.error(`[payments:${params.source}] confirmation email failed:`, err);
  }
}
