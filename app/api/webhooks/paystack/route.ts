import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { supabaseAdmin } from "@/lib/supabase";
import { sendEmail } from "@/lib/emails/send-email";
import PaymentConfirmation from "@/emails/payment-confirmation";

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY ?? "";

export async function POST(request: NextRequest) {
  const rawBody = await request.text();

  const signature = request.headers.get("x-paystack-signature");
  if (!signature || !PAYSTACK_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const hash = crypto.createHmac("sha512", PAYSTACK_SECRET).update(rawBody).digest("hex");
  if (hash !== signature) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const event = JSON.parse(rawBody) as {
    event: string;
    data: {
      status: string;
      amount: number;
      currency: string;
      reference: string;
      paid_at: string;
      metadata?: { client_id?: string; payment_id?: string; description?: string };
    };
  };

  if (event.event === "charge.success") {
    const { reference, paid_at, amount, currency, metadata } = event.data;

    if (!supabaseAdmin) return NextResponse.json({ received: true });

    await supabaseAdmin.from("payments").update({
      status: "paid",
      paid_at,
    }).eq("paystack_reference", reference);

    if (metadata?.client_id) {
      const { data: allPayments } = await supabaseAdmin
        .from("payments")
        .select("status, amount, description")
        .eq("client_id", metadata.client_id);

      const allPaid = (allPayments ?? []).every((p) => p.status === "paid");
      const anyPaid = (allPayments ?? []).some((p) => p.status === "paid");
      const newStatus = allPaid ? "paid" : anyPaid ? "partial" : "pending";

      await supabaseAdmin.from("client_profiles")
        .update({ payment_status: newStatus })
        .eq("id", metadata.client_id);

      await sendPaymentConfirmation({
        clientId: metadata.client_id,
        amount: amount / 100,
        currency,
        description: metadata.description ?? allPayments?.[0]?.description ?? "Application Fee",
      });
    }
  }

  return NextResponse.json({ received: true });
}

async function sendPaymentConfirmation(params: {
  clientId: string;
  amount: number;
  currency: string;
  description: string;
}) {
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
    console.error("[paystack webhook] Failed to send payment confirmation email:", err);
  }
}
