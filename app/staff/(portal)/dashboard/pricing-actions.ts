"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { slugify } from "@/lib/utils";
import { requireSuperAdminStaff } from "@/lib/admin-ability";

export type PricingActionResult = { error?: string; success?: boolean };

const classSchema = z.object({
  name: z.string().trim().min(2, "Name is required."),
  rank: z.coerce.number().int().min(0, "Rank must be a non-negative whole number."),
  description: z.string().trim().max(500).optional().nullable(),
});

const periodSchema = z.object({
  label: z.string().trim().min(2, "Label is required."),
  duration_days: z.coerce.number().int().min(1, "Duration must be at least 1 day."),
  display_order: z.coerce.number().int().optional().default(0),
});

function emptyToNull(v: FormDataEntryValue | null): string | null {
  const s = (v as string ?? "").trim();
  return s.length > 0 ? s : null;
}

export async function createAccessClass(formData: FormData): Promise<PricingActionResult> {
  let gate;
  try {
    gate = await requireSuperAdminStaff();
  } catch {
    return { error: "Forbidden." };
  }
  const { adminClient } = gate;

  const parsed = classSchema.safeParse({
    name: formData.get("name"),
    rank: formData.get("rank"),
    description: emptyToNull(formData.get("description")),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const slug = slugify(parsed.data.name);
  const { error } = await adminClient.from("access_classes").insert({ ...parsed.data, slug });
  if (error) return { error: error.message };

  revalidatePath("/staff/dashboard");
  return { success: true };
}

export async function updateAccessClass(classId: string, formData: FormData): Promise<PricingActionResult> {
  let gate;
  try {
    gate = await requireSuperAdminStaff();
  } catch {
    return { error: "Forbidden." };
  }
  const { adminClient } = gate;
  if (!classId) return { error: "Missing class." };

  const parsed = classSchema.safeParse({
    name: formData.get("name"),
    rank: formData.get("rank"),
    description: emptyToNull(formData.get("description")),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const { error } = await adminClient.from("access_classes").update(parsed.data).eq("id", classId);
  if (error) return { error: error.message };

  revalidatePath("/staff/dashboard");
  return { success: true };
}

export async function setAccessClassActive(classId: string, isActive: boolean): Promise<PricingActionResult> {
  let gate;
  try {
    gate = await requireSuperAdminStaff();
  } catch {
    return { error: "Forbidden." };
  }
  const { adminClient } = gate;

  const { error } = await adminClient.from("access_classes").update({ is_active: isActive }).eq("id", classId);
  if (error) return { error: error.message };

  revalidatePath("/staff/dashboard");
  return { success: true };
}

/** Blocked (not hard-failed silently) if anything still points at this
 *  class — a scholarship requirement or a client's subscription history.
 *  Deactivating (setAccessClassActive) is the safe alternative. */
export async function deleteAccessClass(classId: string): Promise<PricingActionResult> {
  let gate;
  try {
    gate = await requireSuperAdminStaff();
  } catch {
    return { error: "Forbidden." };
  }
  const { adminClient } = gate;
  if (!classId) return { error: "Missing class." };

  const [{ count: scholarshipCount }, { count: subCount }] = await Promise.all([
    adminClient.from("scholarships").select("id", { count: "exact", head: true }).eq("required_class_id", classId),
    adminClient.from("client_subscriptions").select("id", { count: "exact", head: true }).eq("class_id", classId),
  ]);
  if ((scholarshipCount ?? 0) > 0 || (subCount ?? 0) > 0) {
    return { error: "This class is still referenced by scholarships or client subscriptions — deactivate it instead of deleting." };
  }

  const { error } = await adminClient.from("access_classes").delete().eq("id", classId);
  if (error) return { error: error.message };

  revalidatePath("/staff/dashboard");
  return { success: true };
}

export async function createAccessPeriod(formData: FormData): Promise<PricingActionResult> {
  let gate;
  try {
    gate = await requireSuperAdminStaff();
  } catch {
    return { error: "Forbidden." };
  }
  const { adminClient } = gate;

  const parsed = periodSchema.safeParse({
    label: formData.get("label"),
    duration_days: formData.get("duration_days"),
    display_order: formData.get("display_order") || 0,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const { error } = await adminClient.from("access_periods").insert(parsed.data);
  if (error) return { error: error.message };

  revalidatePath("/staff/dashboard");
  return { success: true };
}

export async function updateAccessPeriod(periodId: string, formData: FormData): Promise<PricingActionResult> {
  let gate;
  try {
    gate = await requireSuperAdminStaff();
  } catch {
    return { error: "Forbidden." };
  }
  const { adminClient } = gate;
  if (!periodId) return { error: "Missing period." };

  const parsed = periodSchema.safeParse({
    label: formData.get("label"),
    duration_days: formData.get("duration_days"),
    display_order: formData.get("display_order") || 0,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const { error } = await adminClient.from("access_periods").update(parsed.data).eq("id", periodId);
  if (error) return { error: error.message };

  revalidatePath("/staff/dashboard");
  return { success: true };
}

export async function setAccessPeriodActive(periodId: string, isActive: boolean): Promise<PricingActionResult> {
  let gate;
  try {
    gate = await requireSuperAdminStaff();
  } catch {
    return { error: "Forbidden." };
  }
  const { adminClient } = gate;

  const { error } = await adminClient.from("access_periods").update({ is_active: isActive }).eq("id", periodId);
  if (error) return { error: error.message };

  revalidatePath("/staff/dashboard");
  return { success: true };
}

export async function deleteAccessPeriod(periodId: string): Promise<PricingActionResult> {
  let gate;
  try {
    gate = await requireSuperAdminStaff();
  } catch {
    return { error: "Forbidden." };
  }
  const { adminClient } = gate;
  if (!periodId) return { error: "Missing period." };

  const [{ count: priceCount }, { count: subCount }] = await Promise.all([
    adminClient.from("access_class_prices").select("id", { count: "exact", head: true }).eq("period_id", periodId),
    adminClient.from("client_subscriptions").select("id", { count: "exact", head: true }).eq("period_id", periodId),
  ]);
  if ((priceCount ?? 0) > 0 || (subCount ?? 0) > 0) {
    return { error: "This period still has prices set or client subscriptions — remove those first, or deactivate it instead." };
  }

  const { error } = await adminClient.from("access_periods").delete().eq("id", periodId);
  if (error) return { error: error.message };

  revalidatePath("/staff/dashboard");
  return { success: true };
}

/** Upserts the whole price grid from one submit. Expects fields named
 *  `price__<classId>__<periodId>` for every cell the form rendered; blank
 *  cells are skipped (that combination simply isn't purchasable yet). */
export async function updatePriceMatrix(formData: FormData): Promise<PricingActionResult> {
  let gate;
  try {
    gate = await requireSuperAdminStaff();
  } catch {
    return { error: "Forbidden." };
  }
  const { session, adminClient } = gate;

  const rows: { class_id: string; period_id: string; price_naira: number; updated_by: string }[] = [];
  for (const [key, value] of formData.entries()) {
    const match = /^price__(.+)__(.+)$/.exec(key);
    if (!match) continue;
    const raw = (value as string).trim();
    if (raw === "") continue;
    const price = Number(raw);
    if (!Number.isFinite(price) || price < 0) {
      return { error: `Invalid price entered for one of the cells.` };
    }
    rows.push({ class_id: match[1], period_id: match[2], price_naira: price, updated_by: session.userId });
  }
  if (rows.length === 0) return { error: "No prices to save." };

  const { error } = await adminClient.from("access_class_prices").upsert(rows, { onConflict: "class_id,period_id" });
  if (error) return { error: error.message };

  revalidatePath("/staff/dashboard");
  return { success: true };
}
