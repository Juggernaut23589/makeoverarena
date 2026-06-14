import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/admin-auth";
import { supabaseAdmin } from "@/lib/supabase";

const COOKIE_NAME = "admin_session";

const VALID_STATUSES = ["new", "reviewed", "contacted", "consultation_booked", "proposal_sent", "client", "lost", "on_hold"];

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token || !verifyToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { status, priority, internal_notes } = await request.json() as { status?: string; priority?: string; internal_notes?: string };

  if (status && !VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  if (!supabaseAdmin) {
    return NextResponse.json({ error: "DB not configured" }, { status: 503 });
  }

  const update: Record<string, unknown> = {};
  if (status) update.status = status;
  if (priority) update.priority = priority;
  if (internal_notes !== undefined) update.internal_notes = internal_notes;

  const { error } = await supabaseAdmin.from("inquiries").update(update).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
