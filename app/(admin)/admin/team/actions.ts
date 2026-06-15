"use server";

import { createClient } from "@supabase/supabase-js";
import { getAdminSession } from "@/app/(admin)/admin/login/actions";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

async function requireSuperAdmin() {
  const session = await getAdminSession();
  if (!session || session.role !== "super_admin") throw new Error("Forbidden");
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
}

export async function inviteAdminAction(formData: FormData): Promise<{ error?: string; member?: Record<string, unknown> }> {
  try {
    const adminClient = await requireSuperAdmin();
    const email = ((formData.get("email") as string) ?? "").trim().toLowerCase();
    const fullName = ((formData.get("fullName") as string) ?? "").trim();
    const role = (formData.get("role") as string) ?? "admin";

    if (!email || !fullName) return { error: "Email and full name are required." };
    if (!["admin", "super_admin"].includes(role)) return { error: "Invalid role." };

    // Invite via Supabase Auth (sends email with magic link to set password)
    const { data: inviteData, error: inviteError } = await adminClient.auth.admin.inviteUserByEmail(email, {
      data: { full_name: fullName },
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL ?? "https://makeoverarena.vercel.app"}/api/auth/callback?next=/admin`,
    });

    if (inviteError) {
      if (inviteError.message.includes("already been registered")) {
        return { error: "An account with this email already exists." };
      }
      return { error: inviteError.message };
    }

    // Create staff_profiles row
    const { data: member, error: profileError } = await adminClient
      .from("staff_profiles")
      .insert({ id: inviteData.user.id, full_name: fullName, email, role, is_active: true })
      .select()
      .single();

    if (profileError) return { error: profileError.message };

    return { member: member as Record<string, unknown> };
  } catch {
    return { error: "Forbidden." };
  }
}

export async function updateAdminRoleAction(formData: FormData): Promise<{ error?: string }> {
  try {
    const adminClient = await requireSuperAdmin();
    const userId = (formData.get("userId") as string) ?? "";
    const role = (formData.get("role") as string) ?? "";

    if (!["admin", "super_admin"].includes(role)) return { error: "Invalid role." };

    const { error } = await adminClient
      .from("staff_profiles")
      .update({ role })
      .eq("id", userId);

    if (error) return { error: error.message };
    return {};
  } catch {
    return { error: "Forbidden." };
  }
}

export async function toggleAdminActiveAction(formData: FormData): Promise<{ error?: string }> {
  try {
    const adminClient = await requireSuperAdmin();
    const userId = (formData.get("userId") as string) ?? "";
    const isActive = formData.get("isActive") === "true";

    const { error } = await adminClient
      .from("staff_profiles")
      .update({ is_active: isActive })
      .eq("id", userId);

    if (error) return { error: error.message };
    return {};
  } catch {
    return { error: "Forbidden." };
  }
}
