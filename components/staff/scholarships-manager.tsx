"use client";

import { Fragment, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { COUNTRIES } from "@/lib/validations/inquiry-schema";
import {
  createScholarship,
  updateScholarship,
  deleteScholarship,
  verifyAndPublishScholarship,
  setListingStatus,
  importScholarshipsCsv,
} from "@/app/staff/(portal)/dashboard/scholarship-actions";

export interface ScholarshipRow {
  id: string;
  name: string;
  institution_name: string | null;
  programme_name: string | null;
  destination_country: string | null;
  study_level: string | null;
  funding_type: string | null;
  description: string | null;
  eligibility_notes: string | null;
  amount: string | null;
  application_deadline: string | null;
  application_url: string | null;
  source_url: string | null;
  listing_status: string;
  is_active: boolean;
  last_checked_at: string | null;
  verified_by: string | null;
  verified_at: string | null;
  created_by: string | null;
}

const STUDY_LEVEL_LABELS: Record<string, string> = {
  undergraduate: "Undergraduate",
  graduate: "Graduate",
  phd: "PhD",
  other: "Other",
};

const FUNDING_LABELS: Record<string, string> = { full: "Full funding", partial: "Partial funding" };

const STATUS_COLORS: Record<string, string> = {
  to_be_verified: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  open: "bg-green-500/10 text-green-400 border-green-500/20",
  upcoming: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  closed: "bg-white/10 text-white/40 border-white/10",
};

const STATUS_LABELS: Record<string, string> = {
  to_be_verified: "Needs verification",
  open: "Open",
  upcoming: "Upcoming",
  closed: "Closed",
};

const inputClass =
  "w-full rounded-lg bg-navy-950 border border-white/10 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-crimson-400";
const labelClass = "block text-xs text-white/50 mb-1";

function ScholarshipForm({
  initial,
  onDone,
  onCancel,
}: {
  initial?: ScholarshipRow;
  onDone: () => void;
  onCancel: () => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = initial
        ? await updateScholarship(initial.id, formData)
        : await createScholarship(formData);
      if (result.error) setError(result.error);
      else {
        router.refresh();
        onDone();
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="bg-navy-800 border border-white/10 rounded-xl p-5 space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Scholarship name *</label>
          <input name="name" defaultValue={initial?.name} required className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Institution</label>
          <input name="institution_name" defaultValue={initial?.institution_name ?? ""} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Programme</label>
          <input name="programme_name" defaultValue={initial?.programme_name ?? ""} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Country</label>
          <select name="destination_country" defaultValue={initial?.destination_country ?? ""} className={inputClass}>
            <option value="">—</option>
            {COUNTRIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Study level</label>
          <select name="study_level" defaultValue={initial?.study_level ?? ""} className={inputClass}>
            <option value="">—</option>
            {Object.entries(STUDY_LEVEL_LABELS).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Funding type</label>
          <select name="funding_type" defaultValue={initial?.funding_type ?? ""} className={inputClass}>
            <option value="">—</option>
            {Object.entries(FUNDING_LABELS).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Amount / coverage</label>
          <input name="amount" defaultValue={initial?.amount ?? ""} placeholder="e.g. Full tuition + stipend" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Application deadline</label>
          <input type="date" name="application_deadline" defaultValue={initial?.application_deadline ?? ""} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Official application link</label>
          <input type="url" name="application_url" defaultValue={initial?.application_url ?? ""} placeholder="https://" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Source link (where this was verified)</label>
          <input type="url" name="source_url" defaultValue={initial?.source_url ?? ""} placeholder="https://" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Last checked</label>
          <input type="date" name="last_checked_at" defaultValue={initial?.last_checked_at ?? ""} className={inputClass} />
        </div>
      </div>
      <div>
        <label className={labelClass}>Eligibility notes</label>
        <textarea name="eligibility_notes" defaultValue={initial?.eligibility_notes ?? ""} rows={2} className={inputClass} />
      </div>
      <div>
        <label className={labelClass}>Description</label>
        <textarea name="description" defaultValue={initial?.description ?? ""} rows={3} className={inputClass} />
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isPending}
          className="px-4 py-2 bg-crimson-500 text-white rounded-lg text-sm font-semibold hover:bg-crimson-400 disabled:opacity-50"
        >
          {isPending ? "Saving…" : initial ? "Save changes" : "Add scholarship"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isPending}
          className="px-4 py-2 border border-white/10 text-white/60 rounded-lg text-sm hover:bg-white/5"
        >
          Cancel
        </button>
      </div>
      <p className="text-xs text-white/30">
        New and edited entries stay unpublished until a verifier checks the source and hits
        &ldquo;Verify &amp; Publish&rdquo; below — this form can&apos;t make an entry public on its own.
      </p>
    </form>
  );
}

function deadlineBadge(deadline: string | null): { label: string; cls: string } | null {
  if (!deadline) return null;
  const days = Math.ceil((new Date(deadline).getTime() - Date.now()) / 86_400_000);
  if (days < 0) return { label: "Past deadline", cls: "text-white/30" };
  if (days <= 14) return { label: `Closing soon (${days}d)`, cls: "text-red-400" };
  return { label: new Date(deadline).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" }), cls: "text-white/50" };
}

export function ScholarshipsManager({ scholarships }: { scholarships: ScholarshipRow[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [country, setCountry] = useState("");
  const [studyLevel, setStudyLevel] = useState("");
  const [fundingType, setFundingType] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [q, setQ] = useState("");
  const [importResult, setImportResult] = useState<{ error?: string; imported?: number; skipped?: { row: number; reason: string }[] } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return scholarships.filter((s) => {
      if (country && s.destination_country !== country) return false;
      if (studyLevel && s.study_level !== studyLevel) return false;
      if (fundingType && s.funding_type !== fundingType) return false;
      if (statusFilter && s.listing_status !== statusFilter) return false;
      if (query) {
        const haystack = `${s.name} ${s.institution_name ?? ""} ${s.programme_name ?? ""}`.toLowerCase();
        if (!haystack.includes(query)) return false;
      }
      return true;
    });
  }, [scholarships, country, studyLevel, fundingType, statusFilter, q]);

  function handleDelete(id: string) {
    if (!window.confirm("Delete this scholarship permanently?")) return;
    startTransition(async () => {
      await deleteScholarship(id);
      router.refresh();
    });
  }

  function handleVerify(id: string, status: "open" | "upcoming") {
    startTransition(async () => {
      await verifyAndPublishScholarship(id, status);
      router.refresh();
    });
  }

  function handleStatusChange(id: string, status: "open" | "upcoming" | "closed") {
    startTransition(async () => {
      await setListingStatus(id, status);
      router.refresh();
    });
  }

  function handleImport(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await importScholarshipsCsv(formData);
      setImportResult(result);
      if (!result.error) {
        router.refresh();
        if (fileRef.current) fileRef.current.value = "";
      }
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start sm:items-center justify-between gap-3 flex-wrap">
        <h2 className="font-display text-2xl text-white">Scholarships</h2>
        <div className="flex gap-2">
          <a
            href="/api/staff/scholarships/export"
            className="px-3 py-2 border border-white/10 text-white/60 rounded-lg text-sm hover:bg-white/5"
          >
            Export CSV
          </a>
          <button
            onClick={() => { setCreating((v) => !v); setEditingId(null); }}
            className="px-3 py-2 bg-crimson-500 text-white rounded-lg text-sm font-semibold hover:bg-crimson-400"
          >
            {creating ? "Close" : "+ Add scholarship"}
          </button>
        </div>
      </div>

      {creating && (
        <ScholarshipForm onDone={() => setCreating(false)} onCancel={() => setCreating(false)} />
      )}

      {/* CSV import */}
      <form onSubmit={handleImport} className="bg-navy-800 border border-white/10 rounded-xl p-4 flex flex-wrap items-center gap-3">
        <span className="text-sm text-white/60">Bulk import (CSV):</span>
        <input ref={fileRef} type="file" name="file" accept=".csv,text/csv" className="text-sm text-white/70" />
        <button
          type="submit"
          disabled={isPending}
          className="px-3 py-1.5 border border-white/10 text-white/70 rounded-lg text-sm hover:bg-white/5 disabled:opacity-50"
        >
          Import
        </button>
        <span className="text-xs text-white/30">
          Columns: name, institution_name, programme_name, destination_country, study_level, funding_type,
          amount, application_deadline, application_url, source_url, eligibility_notes, description. Imported
          rows always land unverified.
        </span>
      </form>
      {importResult && (
        <div className="text-sm">
          {importResult.error && <p className="text-red-400">{importResult.error}</p>}
          {typeof importResult.imported === "number" && (
            <p className="text-green-400">Imported {importResult.imported} row(s) as unverified drafts.</p>
          )}
          {importResult.skipped && importResult.skipped.length > 0 && (
            <p className="text-yellow-400">
              Skipped {importResult.skipped.length} row(s): {importResult.skipped.slice(0, 3).map((s) => `row ${s.row} (${s.reason})`).join(", ")}
              {importResult.skipped.length > 3 ? "…" : ""}
            </p>
          )}
        </div>
      )}

      {/* Filters */}
      <div className="bg-navy-800 border border-white/10 rounded-xl p-4 flex flex-wrap gap-2">
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search name, institution, programme…"
          className={cn(inputClass, "flex-1 min-w-[200px]")}
        />
        <select value={country} onChange={(e) => setCountry(e.target.value)} className={cn(inputClass, "w-auto")}>
          <option value="">All countries</option>
          {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={studyLevel} onChange={(e) => setStudyLevel(e.target.value)} className={cn(inputClass, "w-auto")}>
          <option value="">All study levels</option>
          {Object.entries(STUDY_LEVEL_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <select value={fundingType} onChange={(e) => setFundingType(e.target.value)} className={cn(inputClass, "w-auto")}>
          <option value="">All funding types</option>
          {Object.entries(FUNDING_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={cn(inputClass, "w-auto")}>
          <option value="">All statuses</option>
          {Object.entries(STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </div>

      {/* List */}
      <div className="bg-navy-800 rounded-xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="px-5 py-3.5 text-left text-white/50 font-medium">Scholarship</th>
                <th className="px-4 py-3.5 text-left text-white/50 font-medium">Country</th>
                <th className="px-4 py-3.5 text-left text-white/50 font-medium">Deadline</th>
                <th className="px-4 py-3.5 text-left text-white/50 font-medium">Status</th>
                <th className="px-4 py-3.5 text-left text-white/50 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.length === 0 && (
                <tr><td colSpan={5} className="px-5 py-10 text-center text-white/30">No scholarships match these filters.</td></tr>
              )}
              {filtered.map((s) => {
                const badge = deadlineBadge(s.application_deadline);
                return (
                  <Fragment key={s.id}>
                    <tr className="hover:bg-white/5 transition-colors align-top">
                      <td className="px-5 py-3.5">
                        <p className="text-white font-medium">{s.name}</p>
                        <p className="text-white/40 text-xs">
                          {[s.institution_name, s.programme_name].filter(Boolean).join(" · ") || "—"}
                        </p>
                      </td>
                      <td className="px-4 py-3.5 text-white/60">{s.destination_country ?? "—"}</td>
                      <td className={cn("px-4 py-3.5 text-xs", badge?.cls ?? "text-white/30")}>{badge?.label ?? "—"}</td>
                      <td className="px-4 py-3.5">
                        <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium border", STATUS_COLORS[s.listing_status] ?? "border-white/10 text-white/50")}>
                          {STATUS_LABELS[s.listing_status] ?? s.listing_status}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex flex-wrap items-center gap-1.5">
                          {s.listing_status === "to_be_verified" ? (
                            <>
                              <button onClick={() => handleVerify(s.id, "open")} disabled={isPending} className="px-2 py-1 bg-green-500/10 text-green-400 border border-green-500/20 rounded text-xs hover:bg-green-500/20 disabled:opacity-50">
                                Verify &amp; publish
                              </button>
                              <button onClick={() => handleVerify(s.id, "upcoming")} disabled={isPending} className="px-2 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded text-xs hover:bg-blue-500/20 disabled:opacity-50">
                                Verify as upcoming
                              </button>
                            </>
                          ) : (
                            <select
                              value={s.listing_status}
                              onChange={(e) => handleStatusChange(s.id, e.target.value as "open" | "upcoming" | "closed")}
                              disabled={isPending}
                              className="bg-navy-950 border border-white/10 rounded text-xs px-1.5 py-1 text-white/70"
                            >
                              <option value="open">Open</option>
                              <option value="upcoming">Upcoming</option>
                              <option value="closed">Closed</option>
                            </select>
                          )}
                          <button
                            onClick={() => { setEditingId(editingId === s.id ? null : s.id); setCreating(false); }}
                            className="px-2 py-1 border border-white/10 text-white/60 rounded text-xs hover:bg-white/5"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(s.id)}
                            disabled={isPending}
                            className="px-2 py-1 border border-red-500/20 text-red-400 rounded text-xs hover:bg-red-500/10 disabled:opacity-50"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                    {editingId === s.id && (
                      <tr>
                        <td colSpan={5} className="px-5 py-4 bg-navy-900/50">
                          <ScholarshipForm initial={s} onDone={() => setEditingId(null)} onCancel={() => setEditingId(null)} />
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
