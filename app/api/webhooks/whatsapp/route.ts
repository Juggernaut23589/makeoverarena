import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

const VERIFY_TOKEN = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN ?? "";
const APP_SECRET   = process.env.WHATSAPP_APP_SECRET ?? "";
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// ── GET — Meta webhook verification handshake ────────────────────────────────
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const mode      = searchParams.get("hub.mode");
  const token     = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 });
  }
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

// ── POST — Receive incoming messages ────────────────────────────────────────
export async function POST(request: NextRequest) {
  const rawBody = await request.text();

  // Verify payload signature when app secret is configured
  if (APP_SECRET) {
    const sig = request.headers.get("x-hub-signature-256") ?? "";
    const expected = "sha256=" + crypto
      .createHmac("sha256", APP_SECRET)
      .update(rawBody)
      .digest("hex");
    try {
      if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) {
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
      }
    } catch {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }
  }

  let body: WhatsAppWebhookBody;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Only handle whatsapp_business_account events
  if (body.object !== "whatsapp_business_account") {
    return NextResponse.json({ received: true });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = createClient<any>(SUPABASE_URL, SERVICE_KEY);

  for (const entry of body.entry ?? []) {
    for (const change of entry.changes ?? []) {
      if (change.field !== "messages") continue;
      const value = change.value;

      // ── Inbound messages ──────────────────────────────────────────────────
      for (const msg of value.messages ?? []) {
        await handleInboundMessage(db, msg, value.contacts ?? []);
      }

      // ── Status updates (delivered / read / failed) ────────────────────────
      for (const status of value.statuses ?? []) {
        await handleStatusUpdate(db, status);
      }
    }
  }

  return NextResponse.json({ received: true });
}

// ── Helpers ──────────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handleInboundMessage(
  db: ReturnType<typeof createClient<any>>,
  msg: WAMessage,
  contacts: WAContact[]
) {
  const phone       = "+" + msg.from;   // normalize to E.164 with +
  const waMessageId = msg.id;
  const tsWa        = msg.timestamp ? new Date(Number(msg.timestamp) * 1000).toISOString() : new Date().toISOString();
  const contact     = contacts.find((c) => c.wa_id === msg.from);
  const profileName = contact?.profile?.name ?? null;

  const msgType    = msg.type ?? "unknown";
  const textBody   = msg.text?.body ?? null;
  const mediaUrl   = null; // media URLs fetched on demand via Media API
  const mediaMime  = msg.image?.mime_type ?? msg.document?.mime_type ?? msg.audio?.mime_type ?? msg.video?.mime_type ?? null;
  const mediaFilename = msg.document?.filename ?? null;
  const lastMsg    = textBody ?? `[${msgType}]`;

  // Upsert conversation (one row per phone number)
  const { data: conv, error: convErr } = await db
    .from("whatsapp_conversations")
    .upsert(
      {
        wa_phone_number: phone,
        customer_profile_name: profileName,
        last_message: lastMsg,
        last_message_at: tsWa,
        status: "open",
        updated_at: new Date().toISOString(),
      },
      { onConflict: "wa_phone_number" }
    )
    .select("id, unread_count")
    .single<{ id: string; unread_count: number }>();

  if (convErr || !conv) {
    console.error("[wa-webhook] upsert conversation error:", convErr?.message);
    return;
  }

  // Increment unread count
  await db
    .from("whatsapp_conversations")
    .update({ unread_count: (conv.unread_count ?? 0) + 1 })
    .eq("id", conv.id);

  // Insert message (ignore duplicate wa_message_id)
  const { error: msgErr } = await db.from("whatsapp_messages").insert({
    conversation_id: conv.id,
    wa_message_id:   waMessageId,
    direction:       "inbound",
    message_type:    msgType,
    content:         textBody,
    media_url:       mediaUrl,
    media_mime_type: mediaMime,
    media_filename:  mediaFilename,
    status:          "delivered",
    timestamp_wa:    tsWa,
  });

  if (msgErr && !msgErr.message.includes("duplicate")) {
    console.error("[wa-webhook] insert message error:", msgErr.message);
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handleStatusUpdate(
  db: ReturnType<typeof createClient<any>>,
  status: WAStatus
) {
  const newStatus = status.status === "read" ? "read"
    : status.status === "delivered" ? "delivered"
    : status.status === "failed" ? "failed"
    : null;

  if (!newStatus) return;

  await db
    .from("whatsapp_messages")
    .update({ status: newStatus })
    .eq("wa_message_id", status.id);
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface WhatsAppWebhookBody {
  object: string;
  entry?: Array<{
    id: string;
    changes?: Array<{
      field: string;
      value: WAValue;
    }>;
  }>;
}

interface WAValue {
  messages?: WAMessage[];
  statuses?: WAStatus[];
  contacts?: WAContact[];
}

interface WAMessage {
  id: string;
  from: string;
  timestamp?: string;
  type?: string;
  text?: { body: string };
  image?: { mime_type: string; sha256?: string; id?: string };
  document?: { mime_type: string; filename?: string; sha256?: string; id?: string };
  audio?: { mime_type: string; id?: string };
  video?: { mime_type: string; id?: string };
  sticker?: { mime_type: string };
  interactive?: { type: string; button_reply?: { id: string; title: string } };
  reaction?: { message_id: string; emoji: string };
}

interface WAStatus {
  id: string;
  status: string;
  timestamp: string;
  recipient_id: string;
}

interface WAContact {
  wa_id: string;
  profile?: { name: string };
}
