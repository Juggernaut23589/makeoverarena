"use server";

import { requireClientProfile } from "@/lib/client-auth";
import { supabaseAdmin } from "@/lib/supabase";

export type SubscriptionCheckoutResult =
  | { ok: true; paymentId: string }
  | { ok: false; error: string };

/**
 * Creates the `payments` row a subscription purchase settles against, then
 * hands back its id so the client calls the EXISTING, unmodified
 * /api/payments/initiate route (same as the "Pay" button on an invoice) —
 * no separate Paystack integration needed here. metadata.kind is what
 * settleSuccessfulPayment (lib/payments/settle.ts) checks to know this
 * payment should activate a class, not just mark an invoice paid.
 */
export async function createSubscriptionCheckout(classId: string, periodId: string): Promise<SubscriptionCheckoutResult> {
  if (!classId || !periodId) return { ok: false, error: "Missing class or period." };
  if (!supabaseAdmin) return { ok: false, error: "Not configured." };

  const auth = await requireClientProfile();
  if (!auth.ok) return { ok: false, error: auth.error };

  const [{ data: price }, { data: accessClass }, { data: period }] = await Promise.all([
    supabaseAdmin
      .from("access_class_prices")
      .select("price_naira")
      .eq("class_id", classId)
      .eq("period_id", periodId)
      .maybeSingle<{ price_naira: number }>(),
    supabaseAdmin.from("access_classes").select("name").eq("id", classId).maybeSingle<{ name: string }>(),
    supabaseAdmin.from("access_periods").select("label").eq("id", periodId).maybeSingle<{ label: string }>(),
  ]);

  if (!price || !accessClass || !period) {
    return { ok: false, error: "This plan isn't available yet. Please choose another, or contact us." };
  }

  const { data: payment, error } = await supabaseAdmin
    .from("payments")
    .insert({
      client_id: auth.clientId,
      amount: price.price_naira,
      currency: "NGN",
      status: "pending",
      description: `${accessClass.name} — ${period.label}`,
      metadata: { kind: "subscription", class_id: classId, period_id: periodId },
    })
    .select("id")
    .single<{ id: string }>();

  if (error || !payment) return { ok: false, error: error?.message ?? "Could not start checkout." };

  return { ok: true, paymentId: payment.id };
}
