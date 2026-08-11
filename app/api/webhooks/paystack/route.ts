import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { settleSuccessfulPayment } from "@/lib/payments/settle";

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY ?? "";

export async function POST(request: NextRequest) {
  const rawBody = await request.text();

  const signature = request.headers.get("x-paystack-signature");
  if (!signature || !PAYSTACK_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const hash = crypto.createHmac("sha512", PAYSTACK_SECRET).update(rawBody).digest("hex");
  if (hash.length !== signature.length ||
      !crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(signature))) {
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

    // Safe to run more than once — Paystack retries deliveries, and the callback
    // page may have settled this reference already. See lib/payments/settle.ts.
    await settleSuccessfulPayment({
      reference,
      paidAt: paid_at,
      amountKobo: amount,
      currency,
      clientId: metadata?.client_id ?? null,
      description: metadata?.description ?? null,
      source: "webhook",
    });
  }

  return NextResponse.json({ received: true });
}
