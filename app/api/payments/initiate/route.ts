import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { checkPaymentLimit, getIp } from "@/lib/rate-limit";

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

    const { client_id, payment_id, email, amount, description } = await request.json();

    if (!client_id || !email || !amount || !description) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const paystackReady = /^sk_(test|live)_/.test(PAYSTACK_SECRET) && !/your|placeholder|xxxx/i.test(PAYSTACK_SECRET);
    if (!paystackReady) {
      return NextResponse.json(
        { error: "Online payment is not available yet. Please contact us to complete your payment." },
        { status: 503 }
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

    const paystackRes = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        amount: Math.round(amount * 100), // convert to kobo
        callback_url: `${appUrl}/payment/callback`,
        metadata: {
          client_id,
          payment_id,
          description,
          custom_fields: [
            { display_name: "Service", variable_name: "description", value: description },
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

    if (supabaseAdmin && payment_id) {
      await supabaseAdmin.from("payments").update({
        paystack_reference: reference,
        paystack_access_code: access_code,
        authorization_url,
        status: "pending",
      }).eq("id", payment_id);
    } else if (supabaseAdmin) {
      await supabaseAdmin.from("payments").insert({
        client_id,
        amount,
        currency: "NGN",
        status: "pending",
        description,
        paystack_reference: reference,
        paystack_access_code: access_code,
        authorization_url,
      });
    }

    return NextResponse.json({ authorization_url, reference });
  } catch (err) {
    console.error("Payment initiation error:", err);
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
