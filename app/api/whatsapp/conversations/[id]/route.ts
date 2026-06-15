import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { decodeSession, COOKIE_NAME } from "@/lib/admin-auth";
import { supabaseAdmin } from "@/lib/supabase";


// GET /api/whatsapp/conversations/[id] — fetch messages for a conversation
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token || !decodeSession(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  if (!supabaseAdmin) return NextResponse.json({ messages: [] });

  const { data: messages, error } = await supabaseAdmin
    .from("whatsapp_messages")
    .select("id, direction, message_type, content, media_url, media_filename, status, created_at, timestamp_wa")
    .eq("conversation_id", id)
    .order("created_at", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Reset unread count now that messages are read
  await supabaseAdmin
    .from("whatsapp_conversations")
    .update({ unread_count: 0 })
    .eq("id", id);

  return NextResponse.json({ messages: messages ?? [] });
}

// PATCH /api/whatsapp/conversations/[id] — update status / assign
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token || !decodeSession(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json() as { status?: string; customer_name?: string; assigned_to?: string };

  if (!supabaseAdmin) return NextResponse.json({ error: "DB not configured" }, { status: 503 });

  const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (body.status)        update.status        = body.status;
  if (body.customer_name) update.customer_name = body.customer_name;
  if (body.assigned_to !== undefined) update.assigned_to = body.assigned_to;

  const { error } = await supabaseAdmin
    .from("whatsapp_conversations")
    .update(update)
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
