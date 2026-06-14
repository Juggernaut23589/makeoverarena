import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { supabaseAdmin } from "@/lib/supabase";

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
      metadata?: { client_id?: string; payment_id?: string };
    };
  };

  if (event.event === "charge.success") {
    const { reference, paid_at, metadata } = event.data;

    if (!supabaseAdmin) return NextResponse.json({ received: true });

    await supabaseAdmin.from("payments").update({
      status: "paid",
      paid_at,
    }).eq("paystack_reference", reference);

    if (metadata?.client_id) {
      const { data: allPayments } = await supabaseAdmin
        .from("payments")
        .select("status, amount")
        .eq("client_id", metadata.client_id);

      const allPaid = (allPayments ?? []).every((p) => p.status === "paid");
      const anyPaid = (allPayments ?? []).some((p) => p.status === "paid");
      const newStatus = allPaid ? "paid" : anyPaid ? "partial" : "pending";

      await supabaseAdmin.from("client_profiles")
        .update({ payment_status: newStatus })
        .eq("id", metadata.client_id);
    }
  }

  return NextResponse.json({ received: true });
}
