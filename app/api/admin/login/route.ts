import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { encodeSession, COOKIE_NAME, COOKIE_MAX_AGE, type AdminRole } from "@/lib/admin-auth";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(req: NextRequest) {
  const { email: rawEmail, password } = await req.json() as { email: string; password: string };
  const email = (rawEmail ?? "").trim().toLowerCase();

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
  }

  const anonClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const { data: authData, error: authError } = await anonClient.auth.signInWithPassword({ email, password });

  if (authError || !authData.user) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }

  const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  const { data: staff } = await adminClient
    .from("staff_profiles")
    .select("id, full_name, email, role, is_active")
    .or(`id.eq.${authData.user.id},email.eq.${email}`)
    .maybeSingle();

  if (!staff) return NextResponse.json({ error: "Access denied. Not an admin account." }, { status: 403 });
  if (!staff.is_active) return NextResponse.json({ error: "Account deactivated." }, { status: 403 });
  if (!["super_admin", "admin"].includes(staff.role)) {
    return NextResponse.json({ error: "Insufficient permissions." }, { status: 403 });
  }

  const token = await encodeSession({
    userId: staff.id,
    email: staff.email,
    fullName: staff.full_name,
    role: staff.role as AdminRole,
  });

  const res = NextResponse.json({ success: true, role: staff.role });
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });
  return res;
}
