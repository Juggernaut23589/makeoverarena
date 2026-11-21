import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

/** Fire-and-forget view counter for the Reports tab's "most viewed"
 *  metric — no auth required (anonymous visitors can view scholarships
 *  too), never blocks or errors loudly since it's purely informational. */
export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!supabaseAdmin || !id) return NextResponse.json({ ok: true });

  await supabaseAdmin.rpc("increment_scholarship_view", { p_scholarship_id: id }).then(
    () => {},
    () => {}
  );

  return NextResponse.json({ ok: true });
}
