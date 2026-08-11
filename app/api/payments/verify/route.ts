import { NextRequest, NextResponse } from "next/server";
import { settleSuccessfulPayment, markPaymentFailed } from "@/lib/payments/settle";

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
      metadata?: { client_id?: string; payment_id?: string; description?: string };
    };
    message?: string;
  };

  if (!data.status || !data.data) {
    return NextResponse.json({ error: "Verification failed", verified: false }, { status: 400 });
  }

  const txData = data.data;
  const success = txData.status === "success";

  if (success) {
    // Sends the receipt if this path wins the race; no-ops if the webhook
    // already settled it. See lib/payments/settle.ts.
    await settleSuccessfulPayment({
      reference,
      paidAt: txData.paid_at,
      amountKobo: txData.amount,
      currency: txData.currency,
      clientId: txData.metadata?.client_id ?? null,
      description: txData.metadata?.description ?? null,
      source: "verify",
    });
  } else {
    await markPaymentFailed(reference);
  }

  return NextResponse.json({ verified: true, success, reference });
}
