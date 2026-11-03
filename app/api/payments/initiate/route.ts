import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { checkPaymentLimit, getIp } from "@/lib/rate-limit";
import { APP_URL } from "@/lib/site-url";
import { requireClientProfile } from "@/lib/client-auth";

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY ?? "";

export async function POST(request: NextRequest) {
  try {
    const ip = getIp(request);
    const { allowed } = await checkPaymentLimit(ip);
    if (!allowed) {
      return NextResponse.json(
        { error: "Too many payment attempts. Please wait a few minutes and try again." },
        { status: 429 }
      );
    }

    // The client never supplies client_id, amount, or description — those
    // all came straight from the request body before, which meant anyone
    // could initialize a Paystack charge for any amount against any
    // client's record. The only thing the client supplies is which of
    // THEIR OWN pending invoices they're paying; everything Paystack is
    // told comes from that invoice row, looked up server-side.
    const { payment_id } = await request.json();
    if (!payment_id) {
      return NextResponse.json({ error: "Missing payment_id" }, { status: 400 });
    }

    const auth = await requireClientProfile();
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    if (!supabaseAdmin) {
      return NextResponse.json({ error: "Not configured" }, { status: 503 });
    }

    const { data: payment } = await supabaseAdmin
      .from("payments")
      .select("id, client_id, amount, description, status")
      .eq("id", payment_id)
      .maybeSingle<{ id: string; client_id: string; amount: number; description: string; status: string }>();

    if (!payment || payment.client_id !== auth.clientId) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }
    if (payment.status === "paid") {
      return NextResponse.json({ error: "This payment has already been made" }, { status: 409 });
    }

    const paystackReady = /^sk_(test|live)_/.test(PAYSTACK_SECRET) && !/your|placeholder|xxxx/i.test(PAYSTACK_SECRET);
    if (!paystackReady) {
      return NextResponse.json(
        { error: "Online payment is not available yet. Please contact us to complete your payment." },
        { status: 503 }
      );
    }

    const appUrl = APP_URL;

    const paystackRes = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: auth.email,
        amount: Math.round(payment.amount * 100), // convert to kobo
        callback_url: `${appUrl}/payment/callback`,
        metadata: {
          client_id: auth.clientId,
          payment_id: payment.id,
          description: payment.description,
          custom_fields: [
            { display_name: "Service", variable_name: "description", value: payment.description },
          ],
        },
      }),
    });

    const paystackData = (await paystackRes.json()) as {
      status: boolean;
      data?: { authorization_url: string; access_code: string; reference: string };
      message?: string;
    };

    if (!paystackData.status || !paystackData.data) {
      return NextResponse.json(
        { error: paystackData.message ?? "Payment initialization failed" },
        { status: 400 }
      );
    }

    const { authorization_url, access_code, reference } = paystackData.data;

    await supabaseAdmin.from("payments").update({
      paystack_reference: reference,
      paystack_access_code: access_code,
      authorization_url,
      status: "pending",
    }).eq("id", payment.id);

    return NextResponse.json({ authorization_url, reference });
  } catch (err) {
    console.error("Payment initiation error:", err);
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
