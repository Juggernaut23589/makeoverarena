import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { decodeSession, COOKIE_NAME } from "@/lib/admin-auth";
import { supabaseAdmin } from "@/lib/supabase";


export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token || !await decodeSession(token)) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  const { id } = await params;
  const formData = await request.formData();
  const status = formData.get("status") as string;

  if (!supabaseAdmin) return NextResponse.redirect(new URL("/admin/documents", request.url));

  await supabaseAdmin.from("documents").update({ status, reviewed_at: new Date().toISOString() }).eq("id", id);

  return NextResponse.redirect(new URL("/admin/documents", request.url));
}
