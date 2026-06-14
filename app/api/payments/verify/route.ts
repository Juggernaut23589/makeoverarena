import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY ?? "";

export async function GET(request: NextRequest) {
  const reference = request.nextUrl.searchParams.get("reference");
  if (!reference) {
    return NextResponse.json({ error: "Missing reference" }, { status: 400 });
  }

  if (!PAYSTACK_SECRET) {
    return NextResponse.json({ error: "Payment gateway not configured" }, { status: 503 });
  }

  const res = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
    headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` },
  });

  const data = (await res.json()) as {
    status: boolean;
    data?: {
      status: string;
      amount: number;
      currency: string;
      paid_at: string;
      metadata?: { client_id?: string; payment_id?: string };
    };
    message?: string;
  };

  if (!data.status || !data.data) {
    return NextResponse.json({ error: "Verification failed", verified: false }, { status: 400 });
  }

  const txData = data.data;
  const success = txData.status === "success";

  if (supabaseAdmin) {
    await supabaseAdmin.from("payments")
      .update({
        status: success ? "paid" : "failed",
        paid_at: success ? txData.paid_at : null,
      })
      .eq("paystack_reference", reference);

    if (success && txData.metadata?.client_id) {
      const { data: client } = await supabaseAdmin
        .from("client_profiles")
        .select("id, payment_status")
        .eq("id", txData.metadata.client_id)
        .single<{ id: string; payment_status: string }>();

      if (client) {
        const { data: payments } = await supabaseAdmin
          .from("payments")
          .select("status, amount")
          .eq("client_id", client.id);

        const allPaid = (payments ?? []).every((p) => p.status === "paid");
        const anyPaid = (payments ?? []).some((p) => p.status === "paid");
        const newStatus = allPaid ? "paid" : anyPaid ? "partial" : "pending";

        await supabaseAdmin.from("client_profiles")
          .update({ payment_status: newStatus })
          .eq("id", client.id);
      }
    }
  }

  return NextResponse.json({ verified: true, success, reference });
}
