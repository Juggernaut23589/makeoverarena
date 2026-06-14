import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/admin-auth";
import { createClient } from "@supabase/supabase-js";

const COOKIE_NAME        = "admin_session";
const WA_TOKEN           = process.env.WHATSAPP_ACCESS_TOKEN ?? "";
const WA_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID ?? "";
const SUPABASE_URL       = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY        = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const WA_API_VERSION     = "v19.0";

export async function POST(request: NextRequest) {
  // Auth
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token || !verifyToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!WA_TOKEN || !WA_PHONE_NUMBER_ID) {
    return NextResponse.json({ error: "WhatsApp not configured" }, { status: 503 });
  }

  const { conversation_id, to, message, message_type = "text" } = await request.json() as {
    conversation_id: string;
    to: string;          // E.164 phone number with +
    message: string;
    message_type?: string;
  };

  if (!conversation_id || !to || !message) {
    return NextResponse.json({ error: "Missing fields: conversation_id, to, message" }, { status: 400 });
  }

  // Strip leading + for WhatsApp API (needs plain digits)
  const toDigits = to.replace(/^\+/, "");

  // Call Meta WhatsApp Cloud API
  const waRes = await fetch(
    `https://graph.facebook.com/${WA_API_VERSION}/${WA_PHONE_NUMBER_ID}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${WA_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: toDigits,
        type: "text",
        text: { preview_url: false, body: message },
      }),
    }
  );

  const waData = (await waRes.json()) as {
    messages?: Array<{ id: string }>;
    error?: { message: string; code: number };
  };

  if (!waRes.ok || waData.error) {
    const errMsg = waData.error?.message ?? "WhatsApp API error";
    console.error("[wa-send]", errMsg);
    return NextResponse.json({ error: errMsg }, { status: 400 });
  }

  const waMessageId = waData.messages?.[0]?.id ?? null;
  const now = new Date().toISOString();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = createClient<any>(SUPABASE_URL, SERVICE_KEY);

  // Store outbound message in DB
  await db.from("whatsapp_messages").insert({
    conversation_id,
    wa_message_id:   waMessageId,
    direction:       "outbound",
    message_type,
    content:         message,
    status:          "sent",
    timestamp_wa:    now,
  });

  // Update conversation last_message
  await db
    .from("whatsapp_conversations")
    .update({
      last_message:    message,
      last_message_at: now,
      updated_at:      now,
    })
    .eq("id", conversation_id);

  return NextResponse.json({ success: true, wa_message_id: waMessageId });
}
