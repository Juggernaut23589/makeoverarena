import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { decodeSession, COOKIE_NAME } from "@/lib/admin-auth";
import { supabaseAdmin } from "@/lib/supabase";


export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token || !decodeSession(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const status = request.nextUrl.searchParams.get("status") ?? "";

  if (!supabaseAdmin) return NextResponse.json({ conversations: [] });

  let q = supabaseAdmin
    .from("whatsapp_conversations")
    .select("id, wa_phone_number, customer_name, customer_profile_name, last_message, last_message_at, status, unread_count, updated_at")
    .order("updated_at", { ascending: false })
    .limit(100);

  if (status) q = q.eq("status", status);

  const { data, error } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ conversations: data ?? [] });
}
