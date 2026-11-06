"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import Papa from "papaparse";
import { requireStaffAbility } from "@/lib/admin-ability";

export type ScholarshipActionResult = { error?: string; success?: boolean };

const STUDY_LEVELS = ["undergraduate", "graduate", "phd", "other"] as const;
const FUNDING_TYPES = ["full", "partial"] as const;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

const scholarshipFieldsSchema = z.object({
  name: z.string().trim().min(2, "Name is required."),
  institution_name: z.string().trim().max(200).optional().nullable(),
  programme_name: z.string().trim().max(200).optional().nullable(),
  destination_country: z.string().trim().max(100).optional().nullable(),
  study_level: z.enum(STUDY_LEVELS).optional().nullable(),
  funding_type: z.enum(FUNDING_TYPES).optional().nullable(),
  description: z.string().trim().max(4000).optional().nullable(),
  eligibility_notes: z.string().trim().max(4000).optional().nullable(),
  amount: z.string().trim().max(200).optional().nullable(),
  application_deadline: z.string().regex(DATE_RE, "Use YYYY-MM-DD.").optional().nullable(),
  application_url: z.string().trim().url("Enter a valid URL.").optional().nullable(),
  source_url: z.string().trim().url("Enter a valid URL.").optional().nullable(),
  last_checked_at: z.string().regex(DATE_RE, "Use YYYY-MM-DD.").optional().nullable(),
});

function emptyToNull(v: FormDataEntryValue | null): string | null {
  const s = (v as string ?? "").trim();
  return s.length > 0 ? s : null;
}

function readScholarshipFields(formData: FormData) {
  return {
    name: emptyToNull(formData.get("name")) ?? "",
    institution_name: emptyToNull(formData.get("institution_name")),
    programme_name: emptyToNull(formData.get("programme_name")),
    destination_country: emptyToNull(formData.get("destination_country")),
    study_level: emptyToNull(formData.get("study_level")),
    funding_type: emptyToNull(formData.get("funding_type")),
    description: emptyToNull(formData.get("description")),
    eligibility_notes: emptyToNull(formData.get("eligibility_notes")),
    amount: emptyToNull(formData.get("amount")),
    application_deadline: emptyToNull(formData.get("application_deadline")),
    application_url: emptyToNull(formData.get("application_url")),
    source_url: emptyToNull(formData.get("source_url")),
    last_checked_at: emptyToNull(formData.get("last_checked_at")),
  };
}

export async function createScholarship(formData: FormData): Promise<ScholarshipActionResult> {
  let gate;
  try {
    gate = await requireStaffAbility("manage_scholarships");
  } catch {
    return { error: "Forbidden." };
  }
  const { session, adminClient } = gate;

  const parsed = scholarshipFieldsSchema.safeParse(readScholarshipFields(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  // is_active/listing_status are never accepted from the form — only the
  // verify action can publish an entry (enforced again by the DB's
  // scholarships_active_requires_verified constraint).
  const { error } = await adminClient.from("scholarships").insert({
    ...parsed.data,
    last_checked_at: parsed.data.last_checked_at ?? new Date().toISOString().slice(0, 10),
    created_by: session.userId,
  });
  if (error) return { error: error.message };

  revalidatePath("/staff/dashboard");
  return { success: true };
}

export async function updateScholarship(scholarshipId: string, formData: FormData): Promise<ScholarshipActionResult> {
  let gate;
  try {
    gate = await requireStaffAbility("manage_scholarships");
  } catch {
    return { error: "Forbidden." };
  }
  const { adminClient } = gate;
  if (!scholarshipId) return { error: "Missing scholarship." };

  const parsed = scholarshipFieldsSchema.safeParse(readScholarshipFields(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const { error } = await adminClient.from("scholarships").update(parsed.data).eq("id", scholarshipId);
  if (error) return { error: error.message };

  revalidatePath("/staff/dashboard");
  return { success: true };
}

export async function deleteScholarship(scholarshipId: string): Promise<ScholarshipActionResult> {
  let gate;
  try {
    gate = await requireStaffAbility("manage_scholarships");
  } catch {
    return { error: "Forbidden." };
  }
  const { adminClient } = gate;
  if (!scholarshipId) return { error: "Missing scholarship." };

  const { error } = await adminClient.from("scholarships").delete().eq("id", scholarshipId);
  if (error) return { error: error.message };

  revalidatePath("/staff/dashboard");
  return { success: true };
}

/**
 * The only path that can ever set is_active=true. Sets listing_status to
 * "open" by default, or "upcoming" when the caller explicitly marks it so
 * (e.g. an entry sourced ahead of its intake opening) — never jumps
 * straight to "closed" from here.
 */
export async function verifyAndPublishScholarship(
  scholarshipId: string,
  listingStatus: "open" | "upcoming" = "open"
): Promise<ScholarshipActionResult> {
  let gate;
  try {
    gate = await requireStaffAbility("manage_scholarships");
  } catch {
    return { error: "Forbidden." };
  }
  const { session, adminClient } = gate;
  if (!scholarshipId) return { error: "Missing scholarship." };
  if (listingStatus !== "open" && listingStatus !== "upcoming") return { error: "Invalid status." };

  const { error } = await adminClient
    .from("scholarships")
    .update({
      is_active: true,
      listing_status: listingStatus,
      verified_by: session.userId,
      verified_at: new Date().toISOString(),
      last_checked_by: session.userId,
      last_checked_at: new Date().toISOString().slice(0, 10),
    })
    .eq("id", scholarshipId);
  if (error) return { error: error.message };

  revalidatePath("/staff/dashboard");
  return { success: true };
}

/** Quick status toggle for an already-published entry. Never used to
 * publish an unverified one — "to_be_verified" is deliberately not a
 * valid target here, that transition only happens via verify/unverify. */
export async function setListingStatus(
  scholarshipId: string,
  status: "open" | "upcoming" | "closed"
): Promise<ScholarshipActionResult> {
  let gate;
  try {
    gate = await requireStaffAbility("manage_scholarships");
  } catch {
    return { error: "Forbidden." };
  }
  const { adminClient } = gate;
  if (!scholarshipId) return { error: "Missing scholarship." };
  if (!["open", "upcoming", "closed"].includes(status)) return { error: "Invalid status." };

  const { error } = await adminClient
    .from("scholarships")
    .update({ listing_status: status, is_active: status !== "closed" })
    .eq("id", scholarshipId);
  if (error) return { error: error.message };

  revalidatePath("/staff/dashboard");
  return { success: true };
}

const MAX_IMPORT_ROWS = 500;

export type ImportResult = { error?: string; imported?: number; skipped?: { row: number; reason: string }[] };

/**
 * CSV bulk import for the pilot's "10-20 verified sample entries" and any
 * later bulk sourcing. Every imported row lands unverified/unpublished
 * regardless of what the CSV contains — only verifyAndPublishScholarship
 * can make an entry public, so a bad or malicious import can never skip
 * review.
 */
export async function importScholarshipsCsv(formData: FormData): Promise<ImportResult> {
  let gate;
  try {
    gate = await requireStaffAbility("manage_scholarships");
  } catch {
    return { error: "Forbidden." };
  }
  const { session, adminClient } = gate;

  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) return { error: "Choose a CSV file first." };

  const text = await file.text();
  const parsedCsv = Papa.parse<Record<string, string>>(text, { header: true, skipEmptyLines: true });
  if (parsedCsv.errors.length > 0) {
    return { error: `Could not parse the CSV: ${parsedCsv.errors[0].message}` };
  }

  const rows = parsedCsv.data.slice(0, MAX_IMPORT_ROWS);
  if (rows.length === 0) return { error: "The file has no rows." };

  const skipped: { row: number; reason: string }[] = [];
  const toInsert: Record<string, unknown>[] = [];

  rows.forEach((row, i) => {
    const candidate = {
      name: (row.name ?? row.scholarship_name ?? "").trim(),
      institution_name: emptyToNull(row.institution_name ?? row.school ?? null),
      programme_name: emptyToNull(row.programme_name ?? row.programme ?? null),
      destination_country: emptyToNull(row.destination_country ?? row.country ?? null),
      study_level: emptyToNull(row.study_level ?? null),
      funding_type: emptyToNull(row.funding_type ?? null),
      description: emptyToNull(row.description ?? null),
      eligibility_notes: emptyToNull(row.eligibility_notes ?? row.eligibility ?? null),
      amount: emptyToNull(row.amount ?? row.funding ?? null),
      application_deadline: emptyToNull(row.application_deadline ?? row.deadline ?? null),
      application_url: emptyToNull(row.application_url ?? row.official_link ?? null),
      source_url: emptyToNull(row.source_url ?? row.source ?? null),
      last_checked_at: emptyToNull(row.last_checked_at ?? row.last_checked ?? null),
    };
    const parsed = scholarshipFieldsSchema.safeParse(candidate);
    if (!parsed.success) {
      skipped.push({ row: i + 2, reason: parsed.error.issues[0]?.message ?? "Invalid row." });
      return;
    }
    toInsert.push({
      ...parsed.data,
      // Forced regardless of anything the CSV contains — never trust an
      // "is_active"/"verified"/"status" column from an import file.
      listing_status: "to_be_verified",
      is_active: false,
      verified_by: null,
      verified_at: null,
      last_checked_at: parsed.data.last_checked_at ?? new Date().toISOString().slice(0, 10),
      created_by: session.userId,
    });
  });

  if (toInsert.length === 0) {
    return { error: "No valid rows to import.", skipped };
  }

  const { error } = await adminClient.from("scholarships").insert(toInsert);
  if (error) return { error: error.message, skipped };

  revalidatePath("/staff/dashboard");
  return { imported: toInsert.length, skipped };
}
