"use server";

import { revalidatePath } from "next/cache";
import { requireClientProfile } from "@/lib/client-auth";
import { supabaseAdmin } from "@/lib/supabase";

export type SavedScholarshipResult = { ok: boolean; error?: string };

export async function saveScholarship(scholarshipId: string): Promise<SavedScholarshipResult> {
  if (!supabaseAdmin) return { ok: false, error: "Not configured." };
  const auth = await requireClientProfile();
  if (!auth.ok) return { ok: false, error: auth.error };

  const { error } = await supabaseAdmin
    .from("saved_scholarships")
    .upsert({ client_id: auth.clientId, scholarship_id: scholarshipId }, { onConflict: "client_id,scholarship_id", ignoreDuplicates: true });
  if (error) return { ok: false, error: error.message };

  revalidatePath("/dashboard");
  return { ok: true };
}

export async function unsaveScholarship(scholarshipId: string): Promise<SavedScholarshipResult> {
  if (!supabaseAdmin) return { ok: false, error: "Not configured." };
  const auth = await requireClientProfile();
  if (!auth.ok) return { ok: false, error: auth.error };

  const { error } = await supabaseAdmin
    .from("saved_scholarships")
    .delete()
    .eq("client_id", auth.clientId)
    .eq("scholarship_id", scholarshipId);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/dashboard");
  return { ok: true };
}
