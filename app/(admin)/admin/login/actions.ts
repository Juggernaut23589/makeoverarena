"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { encodeSession, decodeSession, COOKIE_NAME, COOKIE_MAX_AGE, type AdminRole } from "@/lib/admin-auth";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function loginAction(
  _prevState: { error?: string; success?: boolean } | undefined,
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  const email = ((formData.get("email") as string) ?? "").trim().toLowerCase();
  const password = (formData.get("password") as string) ?? "";

  if (!email || !password) return { error: "Email and password are required." };

  let anonClient;
  try {
    anonClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  } catch {
    return { error: "Failed to initialise auth client." };
  }

  const { data: authData, error: authError } = await anonClient.auth.signInWithPassword({ email, password });

  if (authError || !authData.user) {
    return { error: "Invalid email or password." };
  }

  let staff;
  try {
    const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    const { data: s } = await adminClient
      .from("staff_profiles")
      .select("id, full_name, email, role, is_active")
      .eq("id", authData.user.id)
      .single();
    staff = s;
  } catch {
    return { error: "Failed to verify admin privileges." };
  }

  if (!staff) {
    return { error: "Access denied. This account is not authorised as an admin." };
  }

  if (!staff.is_active) {
    return { error: "Your admin account has been deactivated. Contact the super admin." };
  }

  if (!["super_admin", "admin"].includes(staff.role)) {
    return { error: "Access denied. Insufficient permissions." };
  }

  let token;
  try {
    token = encodeSession({
      userId: staff.id,
      email: staff.email,
      fullName: staff.full_name,
      role: staff.role as AdminRole,
    });
  } catch {
    return { error: "Failed to create session." };
  }

  try {
    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: COOKIE_MAX_AGE,
      path: "/",
    });
  } catch (err) {
    console.error("Admin login cookie error:", err);
    return { error: "Failed to set session cookie." };
  }

  redirect("/admin");
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
  redirect("/admin/login");
}

export async function getAdminSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return decodeSession(token);
}
