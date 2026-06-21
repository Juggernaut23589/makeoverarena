"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import {
  encodeSession,
  decodeSession,
  STAFF_COOKIE_NAME,
  COOKIE_MAX_AGE,
  type AdminRole,
} from "@/lib/admin-auth";
import { sendEmail } from "@/lib/emails/send-email";
import StaffApproved from "@/emails/staff-approved";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function registerStaffAction(
  _prev: { error?: string; success?: boolean } | undefined,
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  const fullName = ((formData.get("full_name") as string) ?? "").trim();
  const email = ((formData.get("email") as string) ?? "").trim().toLowerCase();
  const password = (formData.get("password") as string) ?? "";
  const phone = ((formData.get("phone") as string) ?? "").trim();
  const jobTitle = ((formData.get("job_title") as string) ?? "").trim();

  if (!fullName || !email || !password || !jobTitle) {
    return { error: "All fields are required." };
  }
  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

  const anonClient = createClient(URL, ANON);
  const adminClient = createClient(URL, SERVICE);

  // Check if already registered
  const { data: existing } = await adminClient
    .from("staff_profiles")
    .select("id")
    .eq("email", email)
    .maybeSingle();
  if (existing) return { error: "An account with this email already exists." };

  // Create Supabase auth user
  const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });

  if (authError || !authData.user) {
    return { error: authError?.message ?? "Failed to create account." };
  }

  // Insert pending staff profile
  const { error: insertError } = await adminClient.from("staff_profiles").insert({
    id: authData.user.id,
    full_name: fullName,
    email,
    phone: phone || null,
    job_title: jobTitle,
    role: "staff",
    is_active: false,
    is_pending: true,
    abilities: {},
  });

  if (insertError) {
    // Rollback auth user
    await adminClient.auth.admin.deleteUser(authData.user.id);
    return { error: "Failed to create staff profile. Please try again." };
  }

  return { success: true };
}

export async function loginStaffAction(
  _prev: { error?: string; success?: boolean } | undefined,
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  const email = ((formData.get("email") as string) ?? "").trim().toLowerCase();
  const password = (formData.get("password") as string) ?? "";

  if (!email || !password) return { error: "Email and password are required." };

  const anonClient = createClient(URL, ANON);
  const { data: authData, error: authError } = await anonClient.auth.signInWithPassword({
    email,
    password,
  });

  if (authError || !authData.user) {
    return { error: "Invalid email or password." };
  }

  const adminClient = createClient(URL, SERVICE);
  const { data: staff } = await adminClient
    .from("staff_profiles")
    .select("id, full_name, email, role, is_active, is_pending, abilities")
    .eq("id", authData.user.id)
    .maybeSingle();

  if (!staff) {
    return { error: "No staff account found for this email." };
  }

  const token = encodeSession({
    userId: staff.id,
    email: staff.email,
    fullName: staff.full_name,
    role: staff.role as AdminRole,
    abilities: staff.abilities ?? {},
    isPending: staff.is_pending || !staff.is_active,
  });

  const cookieStore = await cookies();
  cookieStore.set(STAFF_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });

  return { success: true };
}

export async function logoutStaffAction() {
  const cookieStore = await cookies();
  cookieStore.delete(STAFF_COOKIE_NAME);
  redirect("/staff/login");
}

export async function getStaffSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(STAFF_COOKIE_NAME)?.value;
  if (!token) return null;
  return decodeSession(token);
}

// Called by super_admin to approve a pending staff member
export async function approveStaffAction(staffId: string): Promise<{ error?: string }> {
  const adminClient = createClient(URL, SERVICE);
  const { data: staff, error: fetchErr } = await adminClient
    .from("staff_profiles")
    .select("full_name, email")
    .eq("id", staffId)
    .single();

  if (fetchErr || !staff) return { error: "Staff member not found." };

  const { error } = await adminClient
    .from("staff_profiles")
    .update({ is_active: true, is_pending: false })
    .eq("id", staffId);

  if (error) return { error: error.message };

  const origin = process.env.NEXT_PUBLIC_APP_URL ?? "https://makeoverarena.com";
  await sendEmail({
    to: staff.email,
    subject: "Your MakeoverArena staff account is approved",
    templateName: "staff-approved",
    react: StaffApproved({
      staffName: staff.full_name,
      loginUrl: `${origin}/staff/login`,
    }),
  });

  return {};
}

// Called by super_admin to update a staff member's abilities
export async function updateAbilitiesAction(
  staffId: string,
  abilities: Record<string, boolean>
): Promise<{ error?: string }> {
  const adminClient = createClient(URL, SERVICE);
  const { error } = await adminClient
    .from("staff_profiles")
    .update({ abilities })
    .eq("id", staffId);
  if (error) return { error: error.message };
  return {};
}
