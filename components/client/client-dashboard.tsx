"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { cn, formatDate, formatDateTime } from "@/lib/utils";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { createSubscriptionCheckout } from "@/app/(client)/dashboard/subscription-actions";
import { saveScholarship, unsaveScholarship } from "@/app/(client)/dashboard/saved-scholarships-actions";
import {
  COUNTRIES,
  EDUCATION_LEVELS,
  INTAKE_PERIODS,
  BUDGET_RANGES,
  SERVICE_TYPES,
} from "@/lib/validations/inquiry-schema";

interface ClientProfile {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  city: string | null;
  country: string | null;
  education_level: string | null;
  field_of_study: string | null;
  gpa_percentage: number | null;
  graduation_year: number | null;
  preferred_countries: string[] | null;
  service_type: string | null;
  budget_range: string | null;
  payment_status: string | null;
  gpa: number | null;
  gpa_scale: string | null;
  is_pass_fail: boolean | null;
  current_access_class_id: string | null;
  subscription_expires_at: string | null;
}

interface AccessClass {
  id: string;
  name: string;
  slug: string;
  rank: number;
  description: string | null;
}

interface AccessPeriod {
  id: string;
  label: string;
  duration_days: number;
  display_order: number;
}

interface AccessClassPrice {
  class_id: string;
  period_id: string;
  price_naira: number;
}

interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: string;
  description: string;
  paid_at: string | null;
  created_at: string;
  authorization_url?: string | null;
}

interface Props {
  profile: ClientProfile;
  payments: Payment[];
  accessClasses: AccessClass[];
  accessPeriods: AccessPeriod[];
  accessClassPrices: AccessClassPrice[];
  savedScholarshipIds: string[];
  scholarshipCountByClassId: Record<string, number>;
  freeScholarshipCount: number;
}

const STATUS_BADGE: Record<string, string> = {
  in_progress: "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300",
  completed: "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300",
  not_started: "bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-white/50",
  on_hold: "bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300",
  rejected: "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300",
  scheduled: "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300",
  no_show: "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300",
  cancelled: "bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-white/50",
  paid: "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300",
  pending: "bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300",
  failed: "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300",
  overdue: "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300",
  partial: "bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300",
  pending_review: "bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300",
  approved: "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300",
  needs_resubmission: "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300",
};

const EDUCATION_LABEL: Record<string, string> = Object.fromEntries(
  EDUCATION_LEVELS.map((e) => [e.value, e.label])
);
const SERVICE_LABEL: Record<string, string> = Object.fromEntries(
  SERVICE_TYPES.map((s) => [s.value, s.label])
);
const GPA_SCALE_OPTIONS = [
  { value: "4.0", label: "4.0 Scale" },
  { value: "5.0", label: "5.0 Scale" },
];

type Tab = "overview" | "profile" | "payments" | "scholarships" | "plans";

interface ScholarshipMatch {
  id: string;
  name: string;
  description: string | null;
  destination_country: string | null;
  amount: string | null;
  tuition_range: string | null;
  application_url: string | null;
  institution_name?: string | null;
  programme_name?: string | null;
  study_level?: string | null;
  funding_type?: string | null;
  application_deadline?: string | null;
  source_url?: string | null;
  listing_status?: string | null;
  eligibility_notes?: string | null;
  academic_qualifications?: string | null;
  field_of_study?: string | null;
}

const STUDY_LEVEL_LABELS: Record<string, string> = {
  undergraduate: "Undergraduate",
  graduate: "Graduate",
  phd: "PhD",
  other: "Other",
};

const FUNDING_TYPE_LABELS: Record<string, string> = { full: "Full funding", partial: "Partial funding" };

function scholarshipDeadlineBadge(s: ScholarshipMatch): { label: string; cls: string } | null {
  if (s.listing_status === "upcoming") return { label: "Upcoming", cls: "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400" };
  if (!s.application_deadline) return null;
  const days = Math.ceil((new Date(s.application_deadline).getTime() - Date.now()) / 86_400_000);
  if (days < 0) return { label: "Closed", cls: "bg-gray-100 text-gray-500 dark:bg-white/10 dark:text-white/40" };
  if (days <= 14) return { label: `Closing soon · ${days}d left`, cls: "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400" };
  return { label: "Open", cls: "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400" };
}

export function ClientDashboard({ profile, payments, accessClasses, accessPeriods, accessClassPrices, savedScholarshipIds, scholarshipCountByClassId, freeScholarshipCount }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState<Partial<ClientProfile>>(profile);
  const [saving, setSaving] = useState(false);
  const [payingId, setPayingId] = useState<string | null>(null);
  const [subscribingKey, setSubscribingKey] = useState<string | null>(null);
  const [scholarshipKind, setScholarshipKind] = useState<"scholarships" | "low_tuition" | null>(null);
  const [scholarshipMatches, setScholarshipMatches] = useState<ScholarshipMatch[]>([]);
  const [hiddenScholarshipCount, setHiddenScholarshipCount] = useState(0);
  const [nextTierName, setNextTierName] = useState<string | null>(null);
  const [loadingScholarships, setLoadingScholarships] = useState(false);
  const [browseAllScholarships, setBrowseAllScholarships] = useState(false);
  const [scholarshipCountry, setScholarshipCountry] = useState("");
  const [scholarshipStudyLevel, setScholarshipStudyLevel] = useState("");
  const [scholarshipFunding, setScholarshipFunding] = useState("");
  const [scholarshipSearch, setScholarshipSearch] = useState("");
  const [debouncedScholarshipSearch, setDebouncedScholarshipSearch] = useState("");
  const [scholarshipInstitution, setScholarshipInstitution] = useState("");
  const [scholarshipSort, setScholarshipSort] = useState<"deadline" | "newest" | "name">("deadline");
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set(savedScholarshipIds));
  const [showSavedOnly, setShowSavedOnly] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedScholarshipSearch(scholarshipSearch), 300);
    return () => clearTimeout(timer);
  }, [scholarshipSearch]);

  useEffect(() => {
    const isPassFail = Boolean(profile.is_pass_fail);
    if (!browseAllScholarships && !isPassFail && (!profile.gpa || !profile.gpa_scale)) return;

    setLoadingScholarships(true);
    const params = new URLSearchParams();
    if (browseAllScholarships) {
      params.set("mode", "all");
    } else {
      params.set("is_pass_fail", String(isPassFail));
      if (!isPassFail) {
        params.set("gpa", String(profile.gpa));
        params.set("gpa_scale", String(profile.gpa_scale));
      }
    }
    // Filters layer on top of either mode — they never bypass is_active on
    // the API side, they just narrow whichever base list is being shown.
    if (scholarshipCountry) params.set("country", scholarshipCountry);
    if (scholarshipStudyLevel) params.set("study_level", scholarshipStudyLevel);
    if (scholarshipFunding) params.set("funding_type", scholarshipFunding);
    if (scholarshipInstitution.trim()) params.set("institution", scholarshipInstitution.trim());
    params.set("sort", scholarshipSort);
    if (debouncedScholarshipSearch.trim()) params.set("q", debouncedScholarshipSearch.trim());

    fetch(`/api/scholarships?${params.toString()}`)
      .then((res) => res.json())
      .then((data: { kind: "scholarships" | "low_tuition"; items: ScholarshipMatch[]; hiddenCount?: number; nextTierName?: string | null }) => {
        setScholarshipKind(data.kind);
        setScholarshipMatches(data.items ?? []);
        setHiddenScholarshipCount(data.hiddenCount ?? 0);
        setNextTierName(data.nextTierName ?? null);
      })
      .finally(() => setLoadingScholarships(false));
  }, [
    profile.gpa,
    profile.gpa_scale,
    profile.is_pass_fail,
    browseAllScholarships,
    scholarshipCountry,
    scholarshipStudyLevel,
    scholarshipFunding,
    scholarshipInstitution,
    scholarshipSort,
    debouncedScholarshipSearch,
  ]);

  async function handleToggleSave(scholarshipId: string) {
    setSavingId(scholarshipId);
    try {
      if (savedIds.has(scholarshipId)) {
        await unsaveScholarship(scholarshipId);
        setSavedIds((prev) => { const next = new Set(prev); next.delete(scholarshipId); return next; });
      } else {
        await saveScholarship(scholarshipId);
        setSavedIds((prev) => new Set(prev).add(scholarshipId));
      }
    } catch {
      toast.error("Couldn't update your saved list. Please try again.");
    } finally {
      setSavingId(null);
    }
  }

  function handleDownloadScholarships() {
    const rows = visibleScholarshipMatches;
    const headers = ["Name", "Institution", "Programme", "Country", "Study Level", "Funding Type", "Amount", "Deadline", "Application Link"];
    const csvRows = rows.map((s) =>
      [s.name, s.institution_name, s.programme_name, s.destination_country, s.study_level, s.funding_type, s.amount, s.application_deadline, s.application_url]
        .map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`)
        .join(",")
    );
    const csv = [headers.join(","), ...csvRows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `scholarships-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const visibleScholarshipMatches = showSavedOnly
    ? scholarshipMatches.filter((s) => savedIds.has(s.id))
    : scholarshipMatches;

  const totalPaid = payments.filter((p) => p.status === "paid").reduce((s, p) => s + p.amount, 0);
  const totalOwed = payments.filter((p) => p.status === "pending").reduce((s, p) => s + p.amount, 0);
  const pendingPayment = payments.find((p) => p.status === "pending");

  const handleSaveProfile = async () => {
    setSaving(true);
    const payload: Record<string, unknown> = {
      phone: editData.phone,
      city: editData.city,
      country: editData.country,
      education_level: editData.education_level,
      field_of_study: editData.field_of_study,
      graduation_year: editData.graduation_year,
      preferred_countries: editData.preferred_countries,
      service_type: editData.service_type,
      budget_range: editData.budget_range,
      gpa: editData.gpa,
      gpa_scale: editData.gpa_scale,
      is_pass_fail: editData.is_pass_fail,
    };
    const res = await fetch(`/api/client/profile`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      toast.success("Profile updated");
      setEditMode(false);
    } else {
      const err = (await res.json()) as { error?: string };
      toast.error(err.error ?? "Failed to save profile");
    }
    setSaving(false);
  };

  const handlePay = async (payment: Payment) => {
    setPayingId(payment.id);
    try {
      if (payment.authorization_url) {
        window.location.href = payment.authorization_url;
        return;
      }
      const res = await fetch("/api/payments/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payment_id: payment.id }),
      });
      const data = (await res.json()) as { authorization_url?: string; error?: string };
      if (!res.ok || !data.authorization_url) {
        toast.error(data.error ?? "Payment failed to initialize");
        return;
      }
      window.location.href = data.authorization_url;
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setPayingId(null);
    }
  };

  const handleSubscribe = async (classId: string, periodId: string) => {
    const key = `${classId}__${periodId}`;
    setSubscribingKey(key);
    try {
      const result = await createSubscriptionCheckout(classId, periodId);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      const res = await fetch("/api/payments/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payment_id: result.paymentId }),
      });
      const data = (await res.json()) as { authorization_url?: string; error?: string };
      if (!res.ok || !data.authorization_url) {
        toast.error(data.error ?? "Payment failed to initialize");
        return;
      }
      window.location.href = data.authorization_url;
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setSubscribingKey(null);
    }
  };

  const toggleCountry = (country: string) => {
    const current = editData.preferred_countries ?? [];
    const next = current.includes(country)
      ? current.filter((c) => c !== country)
      : [...current, country];
    setEditData({ ...editData, preferred_countries: next });
  };

  const handleLogout = async () => {
    if (supabase) await supabase.auth.signOut();
    window.location.href = "/login";
  };

  const tabs: { id: Tab; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "profile", label: "My Profile" },
    { id: "payments", label: "Payments" },
    { id: "scholarships", label: scholarshipKind === "low_tuition" ? "Low Tuition" : "Scholarships" },
    { id: "plans", label: "Plans" },
  ];

  const currentAccessClass = accessClasses.find((c) => c.id === profile.current_access_class_id) ?? null;
  const subscriptionActive = Boolean(
    currentAccessClass && profile.subscription_expires_at && new Date(profile.subscription_expires_at).getTime() > Date.now()
  );
  const daysLeft = profile.subscription_expires_at
    ? Math.ceil((new Date(profile.subscription_expires_at).getTime() - Date.now()) / 86_400_000)
    : null;

  return (
    <div className="min-h-screen bg-cream dark:bg-navy-950">
      <header className="bg-white dark:bg-navy-900 border-b border-border shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <a
              href="https://www.makeoverarena.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-navy-500 dark:text-white/60 hover:text-navy-900 dark:hover:text-white font-medium transition-colors"
            >
              Blog
            </a>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-navy-100 dark:bg-navy-700 flex items-center justify-center text-xs font-semibold text-navy-700 dark:text-white">
                {profile.full_name.charAt(0)}
              </div>
              <span className="text-sm text-navy-600 dark:text-white/70">{profile.full_name.split(" ")[0]}</span>
            </div>
            <button
              onClick={handleLogout}
              className="text-xs text-navy-400 hover:text-navy-700 dark:hover:text-white border border-border rounded-lg px-2 py-1 transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <div className="bg-white dark:bg-navy-900 border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="-mx-4 sm:mx-0 flex gap-0 overflow-x-auto scrollbar-hide px-4 sm:px-0">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "shrink-0 px-3 sm:px-4 py-3.5 text-xs sm:text-sm font-medium whitespace-nowrap border-b-2 transition-all",
                  activeTab === tab.id
                    ? "border-crimson-500 text-navy-900 dark:text-white"
                    : "border-transparent text-navy-500 dark:text-white/50 hover:text-navy-700 dark:hover:text-white/70"
                )}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* ── OVERVIEW ── */}
        {activeTab === "overview" && (
          <>
            <h2 className="font-display text-2xl text-navy-900 dark:text-white">
              Welcome back, {profile.full_name.split(" ")[0]}
            </h2>

            {/* Subscription status — surfaced here, not just buried in Plans */}
            {subscriptionActive && currentAccessClass ? (
              <div className={cn(
                "rounded-xl p-4 flex items-center justify-between gap-4 flex-wrap",
                daysLeft !== null && daysLeft < 7
                  ? "bg-amber-50 dark:bg-amber-500/10 border border-amber-300 dark:border-amber-500/30"
                  : "bg-white dark:bg-navy-800 border border-border"
              )}>
                <p className="text-sm text-navy-700 dark:text-white/70">
                  <span className="font-semibold">{currentAccessClass.name}</span> plan active
                  {daysLeft !== null && (
                    <span className={daysLeft < 7 ? "text-amber-700 dark:text-amber-400 font-medium" : ""}>
                      {" "}— expires in {daysLeft} day{daysLeft === 1 ? "" : "s"}
                    </span>
                  )}
                </p>
                <button onClick={() => setActiveTab("plans")} className="text-xs font-semibold px-3 py-1.5 rounded-full border border-border text-navy-600 dark:text-white/70 hover:bg-navy-50 dark:hover:bg-white/5 shrink-0">
                  {daysLeft !== null && daysLeft < 7 ? "Renew now →" : "Manage plan →"}
                </button>
              </div>
            ) : (
              <div className="bg-white dark:bg-navy-800 border border-border rounded-xl p-4 flex items-center justify-between gap-4 flex-wrap">
                <p className="text-sm text-navy-500 dark:text-white/50">No active scholarship-database plan yet.</p>
                <button onClick={() => setActiveTab("plans")} className="text-xs font-semibold px-3 py-1.5 rounded-full bg-crimson-500 text-white hover:bg-crimson-400 shrink-0">
                  View plans →
                </button>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Paid", value: `₦${totalPaid.toLocaleString()}`, icon: "✅" },
                { label: "Outstanding", value: `₦${totalOwed.toLocaleString()}`, icon: "⏳" },
              ].map((s) => (
                <div key={s.label} className="bg-white dark:bg-navy-800 rounded-xl p-5 border border-border shadow-card">
                  <div className="text-2xl mb-1">{s.icon}</div>
                  <div className="font-display text-2xl font-light text-navy-900 dark:text-white mb-0.5">{s.value}</div>
                  <div className="text-navy-500 dark:text-white/50 text-xs">{s.label}</div>
                </div>
              ))}
            </div>

            {totalOwed > 0 && pendingPayment && (
              <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700/30 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="font-semibold text-orange-800 dark:text-orange-300">Payment due</p>
                  <p className="text-orange-600 dark:text-orange-400 text-sm">
                    {pendingPayment.description} — ₦{totalOwed.toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => handlePay(pendingPayment)}
                  disabled={payingId === pendingPayment.id}
                  className="px-5 py-2.5 bg-orange-600 text-white rounded-lg text-sm font-semibold hover:bg-orange-500 transition-colors whitespace-nowrap disabled:opacity-60"
                >
                  {payingId === pendingPayment.id ? "Redirecting…" : "Pay Now via Paystack →"}
                </button>
              </div>
            )}
          </>
        )}

        {/* ── PROFILE ── */}
        {activeTab === "profile" && (
          <div className="bg-white dark:bg-navy-800 rounded-xl border border-border shadow-card">
            <div className="px-6 py-5 border-b border-border flex items-center justify-between">
              <h3 className="font-display text-lg text-navy-900 dark:text-white">Personal & Academic Details</h3>
              {!editMode ? (
                <button onClick={() => setEditMode(true)} className="text-sm text-crimson-600 hover:text-crimson-500 font-medium">Edit</button>
              ) : (
                <div className="flex gap-3">
                  <button onClick={() => { setEditMode(false); setEditData(profile); }} className="text-sm text-navy-400 dark:text-white/40 hover:text-navy-600">Cancel</button>
                  <button onClick={handleSaveProfile} disabled={saving} className="text-sm text-crimson-600 hover:text-crimson-500 font-medium disabled:opacity-50">
                    {saving ? "Saving…" : "Save"}
                  </button>
                </div>
              )}
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Full Name — readonly */}
              <div>
                <label className="block text-xs font-medium text-navy-500 dark:text-white/50 mb-1.5">Full Name</label>
                <p className="text-navy-800 dark:text-white/80 text-sm">{profile.full_name}</p>
              </div>

              {/* Email — readonly */}
              <div>
                <label className="block text-xs font-medium text-navy-500 dark:text-white/50 mb-1.5">Email</label>
                <p className="text-navy-800 dark:text-white/80 text-sm">{profile.email}</p>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-medium text-navy-500 dark:text-white/50 mb-1.5">Phone</label>
                {editMode ? (
                  <input type="text" value={editData.phone ?? ""} onChange={(e) => setEditData({ ...editData, phone: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-border bg-cream dark:bg-navy-700 text-navy-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-crimson-400" />
                ) : (
                  <p className="text-navy-800 dark:text-white/80 text-sm">{profile.phone || <span className="text-navy-400 dark:text-white/30 italic">Not provided</span>}</p>
                )}
              </div>

              {/* City */}
              <div>
                <label className="block text-xs font-medium text-navy-500 dark:text-white/50 mb-1.5">City</label>
                {editMode ? (
                  <input type="text" value={editData.city ?? ""} onChange={(e) => setEditData({ ...editData, city: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-border bg-cream dark:bg-navy-700 text-navy-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-crimson-400" />
                ) : (
                  <p className="text-navy-800 dark:text-white/80 text-sm">{profile.city || <span className="text-navy-400 dark:text-white/30 italic">Not provided</span>}</p>
                )}
              </div>

              {/* Country */}
              <div>
                <label className="block text-xs font-medium text-navy-500 dark:text-white/50 mb-1.5">Country</label>
                {editMode ? (
                  <input type="text" value={editData.country ?? ""} onChange={(e) => setEditData({ ...editData, country: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-border bg-cream dark:bg-navy-700 text-navy-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-crimson-400" />
                ) : (
                  <p className="text-navy-800 dark:text-white/80 text-sm">{profile.country || <span className="text-navy-400 dark:text-white/30 italic">Not provided</span>}</p>
                )}
              </div>

              {/* Education Level */}
              <div>
                <label className="block text-xs font-medium text-navy-500 dark:text-white/50 mb-1.5">Education Level</label>
                {editMode ? (
                  <select value={editData.education_level ?? ""} onChange={(e) => setEditData({ ...editData, education_level: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-border bg-cream dark:bg-navy-700 text-navy-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-crimson-400">
                    <option value="">Select...</option>
                    {EDUCATION_LEVELS.map((e) => <option key={e.value} value={e.value}>{e.label}</option>)}
                  </select>
                ) : (
                  <p className="text-navy-800 dark:text-white/80 text-sm">{EDUCATION_LABEL[profile.education_level ?? ""] || profile.education_level || <span className="text-navy-400 dark:text-white/30 italic">Not provided</span>}</p>
                )}
              </div>

              {/* Field of Study */}
              <div>
                <label className="block text-xs font-medium text-navy-500 dark:text-white/50 mb-1.5">Field of Study</label>
                {editMode ? (
                  <input type="text" value={editData.field_of_study ?? ""} onChange={(e) => setEditData({ ...editData, field_of_study: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-border bg-cream dark:bg-navy-700 text-navy-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-crimson-400" />
                ) : (
                  <p className="text-navy-800 dark:text-white/80 text-sm">{profile.field_of_study || <span className="text-navy-400 dark:text-white/30 italic">Not provided</span>}</p>
                )}
              </div>

              {/* GPA Section */}
              <div className="sm:col-span-2 border border-border rounded-xl p-4 space-y-4">
                <label className="block text-xs font-medium text-navy-500 dark:text-white/50">Grade Info</label>
                {editMode ? (
                  <>
                    <label className="flex items-center gap-2 text-sm text-navy-800 dark:text-white/80">
                      <input type="checkbox" checked={editData.is_pass_fail ?? false} onChange={(e) => setEditData({ ...editData, is_pass_fail: e.target.checked, gpa: null, gpa_scale: null })} className="rounded border-border" />
                      Pass / Fail grading system
                    </label>
                    {!editData.is_pass_fail && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-navy-500 dark:text-white/50 mb-1.5">GPA Scale</label>
                          <select value={editData.gpa_scale ?? ""} onChange={(e) => setEditData({ ...editData, gpa_scale: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-border bg-cream dark:bg-navy-700 text-navy-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-crimson-400">
                            <option value="">Select scale...</option>
                            {GPA_SCALE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-navy-500 dark:text-white/50 mb-1.5">GPA</label>
                          <input type="number" step="0.01" min="0" max={editData.gpa_scale === "5.0" ? 5 : 4} value={editData.gpa ?? ""} onChange={(e) => setEditData({ ...editData, gpa: e.target.value ? parseFloat(e.target.value) : null })} className="w-full px-3 py-2 rounded-lg border border-border bg-cream dark:bg-navy-700 text-navy-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-crimson-400" />
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-navy-800 dark:text-white/80 text-sm">
                    {profile.is_pass_fail
                      ? "Pass / Fail"
                      : profile.gpa != null && profile.gpa_scale
                        ? `${profile.gpa} / ${profile.gpa_scale}`
                        : <span className="text-navy-400 dark:text-white/30 italic">Not provided</span>}
                  </p>
                )}
              </div>

              {/* Graduation Year */}
              <div>
                <label className="block text-xs font-medium text-navy-500 dark:text-white/50 mb-1.5">Graduation Year</label>
                {editMode ? (
                  <input type="number" min="1990" max="2030" value={editData.graduation_year ?? ""} onChange={(e) => setEditData({ ...editData, graduation_year: e.target.value ? parseInt(e.target.value) : null })} className="w-full px-3 py-2 rounded-lg border border-border bg-cream dark:bg-navy-700 text-navy-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-crimson-400" />
                ) : (
                  <p className="text-navy-800 dark:text-white/80 text-sm">{profile.graduation_year ?? <span className="text-navy-400 dark:text-white/30 italic">Not provided</span>}</p>
                )}
              </div>

              {/* Service Type */}
              <div>
                <label className="block text-xs font-medium text-navy-500 dark:text-white/50 mb-1.5">Service Type</label>
                {editMode ? (
                  <select value={editData.service_type ?? ""} onChange={(e) => setEditData({ ...editData, service_type: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-border bg-cream dark:bg-navy-700 text-navy-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-crimson-400">
                    <option value="">Select...</option>
                    {SERVICE_TYPES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                ) : (
                  <p className="text-navy-800 dark:text-white/80 text-sm">{SERVICE_LABEL[profile.service_type ?? ""] || profile.service_type || <span className="text-navy-400 dark:text-white/30 italic">Not provided</span>}</p>
                )}
              </div>

              {/* Budget Range */}
              <div>
                <label className="block text-xs font-medium text-navy-500 dark:text-white/50 mb-1.5">Budget Range</label>
                {editMode ? (
                  <select value={editData.budget_range ?? ""} onChange={(e) => setEditData({ ...editData, budget_range: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-border bg-cream dark:bg-navy-700 text-navy-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-crimson-400">
                    <option value="">Select...</option>
                    {BUDGET_RANGES.map((b) => <option key={b} value={b}>{b}</option>)}
                  </select>
                ) : (
                  <p className="text-navy-800 dark:text-white/80 text-sm">{profile.budget_range || <span className="text-navy-400 dark:text-white/30 italic">Not provided</span>}</p>
                )}
              </div>

              {/* Preferred Countries */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-navy-500 dark:text-white/50 mb-1.5">Preferred Countries</label>
                {editMode ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {COUNTRIES.map((country) => {
                      const selected = editData.preferred_countries?.includes(country) ?? false;
                      return (
                        <label key={country} className={cn("flex items-center gap-2 px-3 py-2 rounded-lg border text-sm cursor-pointer transition-colors", selected ? "border-crimson-500 bg-crimson-50 dark:bg-crimson-900/20 text-navy-900 dark:text-white" : "border-border text-navy-600 dark:text-white/60 hover:border-navy-300")}>
                          <input type="checkbox" checked={selected} onChange={() => toggleCountry(country)} className="sr-only" />
                          {selected ? "✓" : ""} {country}
                        </label>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-navy-800 dark:text-white/80 text-sm">{profile.preferred_countries?.join(", ") || <span className="text-navy-400 dark:text-white/30 italic">Not provided</span>}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── PAYMENTS ── */}
        {activeTab === "payments" && (
          <div className="space-y-4">
            <h2 className="font-display text-2xl text-navy-900 dark:text-white">Payments</h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[
                { label: "Total Paid", value: `₦${totalPaid.toLocaleString()}`, style: "text-green-600 dark:text-green-400" },
                { label: "Outstanding", value: `₦${totalOwed.toLocaleString()}`, style: "text-orange-600 dark:text-orange-400" },
                { label: "Payment Status", value: profile.payment_status ?? "pending", style: cn("text-sm capitalize", STATUS_BADGE[profile.payment_status ?? "pending"]) },
              ].map((s) => (
                <div key={s.label} className="bg-white dark:bg-navy-800 rounded-xl border border-border shadow-card p-5">
                  <div className={cn("font-display text-xl font-light mb-1", s.style)}>{s.value}</div>
                  <div className="text-navy-500 dark:text-white/50 text-xs">{s.label}</div>
                </div>
              ))}
            </div>

            <div className="bg-white dark:bg-navy-800 rounded-xl border border-border shadow-card overflow-hidden">
              <div className="px-5 py-4 border-b border-border">
                <h3 className="font-medium text-navy-900 dark:text-white">Payment History</h3>
              </div>
              {payments.length === 0 ? (
                <div className="p-10 text-center text-navy-400 dark:text-white/30 text-sm">No payment records yet</div>
              ) : (
                <div className="divide-y divide-border">
                  {payments.map((p) => (
                    <div key={p.id} className="px-5 py-4 flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <p className="text-navy-800 dark:text-white/80 text-sm font-medium truncate">{p.description}</p>
                        <p className="text-navy-400 dark:text-white/30 text-xs">{p.paid_at ? formatDateTime(p.paid_at) : formatDate(p.created_at)}</p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className={cn("text-xs px-2.5 py-0.5 rounded-full font-medium", STATUS_BADGE[p.status] ?? "bg-gray-100 text-gray-600")}>
                          {p.status}
                        </span>
                        <span className="font-medium text-navy-900 dark:text-white text-sm">₦{p.amount.toLocaleString()}</span>
                        {p.status === "pending" && (
                          <button
                            onClick={() => handlePay(p)}
                            disabled={payingId === p.id}
                            className="text-xs px-3 py-1.5 bg-crimson-500 text-white rounded-lg font-semibold hover:bg-crimson-400 transition-colors disabled:opacity-60"
                          >
                            {payingId === p.id ? "…" : "Pay"}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── SCHOLARSHIPS / LOW TUITION ── */}
        {activeTab === "scholarships" && (
          <div className="space-y-4">
            {hiddenScholarshipCount > 0 && (
              <div className="bg-gradient-to-r from-crimson-500 to-crimson-600 rounded-xl p-4 flex items-center justify-between gap-4 flex-wrap text-white">
                <p className="text-sm font-medium">
                  🔒 {hiddenScholarshipCount} more scholarship{hiddenScholarshipCount === 1 ? "" : "s"} match your profile
                  {nextTierName ? <> on <strong>{nextTierName}</strong></> : null} — upgrade to unlock {hiddenScholarshipCount === 1 ? "it" : "them"}.
                </p>
                <button
                  onClick={() => setActiveTab("plans")}
                  className="text-xs font-semibold px-3 py-1.5 rounded-full bg-white text-crimson-600 hover:bg-white/90 transition-colors shrink-0"
                >
                  View plans →
                </button>
              </div>
            )}
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <h2 className="font-display text-2xl text-navy-900 dark:text-white">
                {scholarshipKind === "low_tuition" ? "Low Tuition Packages" : "Matched Scholarships"}
              </h2>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => setShowSavedOnly((v) => !v)}
                  className={cn(
                    "text-xs font-semibold px-3 py-1.5 rounded-full border-2 transition-colors flex items-center gap-1.5",
                    showSavedOnly
                      ? "bg-amber-400 text-navy-900 border-amber-400"
                      : savedIds.size > 0
                      ? "border-amber-400 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-500/10"
                      : "border-border text-navy-500 dark:text-white/50 hover:bg-navy-50 dark:hover:bg-white/5"
                  )}
                >
                  ★ Saved{savedIds.size > 0 ? ` (${savedIds.size})` : ""}
                </button>
                {scholarshipKind !== "low_tuition" && (
                  <button
                    onClick={() => setBrowseAllScholarships((v) => !v)}
                    className={cn(
                      "text-xs font-medium px-3 py-1.5 rounded-full border transition-colors",
                      browseAllScholarships
                        ? "bg-crimson-500 text-white border-crimson-500"
                        : "border-border text-navy-600 dark:text-white/60 hover:bg-navy-50 dark:hover:bg-white/5"
                    )}
                  >
                    {browseAllScholarships ? "Showing all open scholarships" : "Browse all open scholarships"}
                  </button>
                )}
                {visibleScholarshipMatches.length > 0 && (
                  <button
                    onClick={handleDownloadScholarships}
                    className="text-xs font-medium px-3 py-1.5 rounded-full border border-border text-navy-600 dark:text-white/60 hover:bg-navy-50 dark:hover:bg-white/5"
                  >
                    Download CSV
                  </button>
                )}
              </div>
            </div>

            {browseAllScholarships && (
              <div className="bg-white dark:bg-navy-800 rounded-xl border border-border shadow-card p-4 flex flex-wrap gap-2">
                <input
                  type="search"
                  value={scholarshipSearch}
                  onChange={(e) => setScholarshipSearch(e.target.value)}
                  placeholder="Search name, institution, programme…"
                  className="flex-1 min-w-[180px] h-9 px-3 text-sm border border-border rounded-lg bg-navy-50 dark:bg-navy-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-crimson-400"
                />
                <select
                  value={scholarshipCountry}
                  onChange={(e) => setScholarshipCountry(e.target.value)}
                  className="h-9 px-2 text-sm border border-border rounded-lg bg-white dark:bg-navy-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-crimson-400"
                >
                  <option value="">All countries</option>
                  {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <select
                  value={scholarshipStudyLevel}
                  onChange={(e) => setScholarshipStudyLevel(e.target.value)}
                  className="h-9 px-2 text-sm border border-border rounded-lg bg-white dark:bg-navy-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-crimson-400"
                >
                  <option value="">All study levels</option>
                  {Object.entries(STUDY_LEVEL_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
                <select
                  value={scholarshipFunding}
                  onChange={(e) => setScholarshipFunding(e.target.value)}
                  className="h-9 px-2 text-sm border border-border rounded-lg bg-white dark:bg-navy-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-crimson-400"
                >
                  <option value="">All funding types</option>
                  {Object.entries(FUNDING_TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
                <input
                  type="search"
                  value={scholarshipInstitution}
                  onChange={(e) => setScholarshipInstitution(e.target.value)}
                  placeholder="Institution…"
                  className="h-9 px-3 text-sm border border-border rounded-lg bg-navy-50 dark:bg-navy-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-crimson-400"
                />
                <select
                  value={scholarshipSort}
                  onChange={(e) => setScholarshipSort(e.target.value as "deadline" | "newest" | "name")}
                  className="h-9 px-2 text-sm border border-border rounded-lg bg-white dark:bg-navy-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-crimson-400"
                >
                  <option value="deadline">Sort: Deadline</option>
                  <option value="newest">Sort: Recently added</option>
                  <option value="name">Sort: Name</option>
                </select>
              </div>
            )}

            {loadingScholarships ? (
              <p className="text-navy-500 dark:text-white/50 text-sm">Loading matches…</p>
            ) : visibleScholarshipMatches.length === 0 ? (
              <div className="bg-white dark:bg-navy-800 rounded-xl border border-border shadow-card p-12 text-center">
                <div className="text-4xl mb-3">🎓</div>
                <p className="text-navy-500 dark:text-white/50 text-sm">
                  {showSavedOnly
                    ? "You haven't saved any scholarships yet."
                    : browseAllScholarships
                    ? "No scholarships match these filters yet."
                    : profile.gpa || profile.is_pass_fail
                      ? "No matches found yet. Your advisor will share options shortly."
                      : "Complete your academic info to see matched scholarships."}
                </p>
              </div>
            ) : (
              visibleScholarshipMatches.map((s, i) => {
                const badge = scholarshipDeadlineBadge(s);
                return (
                  <motion.div
                    key={s.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i, 8) * 0.04, duration: 0.25 }}
                    className="bg-white dark:bg-navy-800 rounded-xl border border-border shadow-card p-5"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h4 className="font-display text-lg text-navy-900 dark:text-white">{s.name}</h4>
                        <p className="text-navy-500 dark:text-white/50 text-xs mt-0.5">
                          {[s.institution_name, s.programme_name, s.destination_country].filter(Boolean).join(" · ")}
                        </p>
                        {s.description && <p className="text-navy-600 dark:text-white/60 text-sm mt-2">{s.description}</p>}
                        {(s.academic_qualifications || s.field_of_study || s.eligibility_notes) && (
                          <p className="text-navy-400 dark:text-white/40 text-xs mt-2">
                            {[s.field_of_study, s.academic_qualifications, s.eligibility_notes].filter(Boolean).join(" · ")}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <span className="text-sm font-semibold text-crimson-600 dark:text-crimson-400">
                          {s.amount ?? s.tuition_range ?? (s.funding_type ? FUNDING_TYPE_LABELS[s.funding_type] : "")}
                        </span>
                        <button
                          onClick={() => handleToggleSave(s.id)}
                          disabled={savingId === s.id}
                          aria-label={savedIds.has(s.id) ? "Remove from saved" : "Save scholarship"}
                          className={cn(
                            "text-xs px-2 py-1 rounded-full border transition-colors",
                            savedIds.has(s.id)
                              ? "bg-crimson-500 text-white border-crimson-500"
                              : "border-border text-navy-500 dark:text-white/50 hover:bg-navy-50 dark:hover:bg-white/5"
                          )}
                        >
                          {savedIds.has(s.id) ? "★ Saved" : "☆ Save"}
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-3 flex-wrap">
                      {s.study_level && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-navy-100 text-navy-600 dark:bg-white/10 dark:text-white/60">
                          {STUDY_LEVEL_LABELS[s.study_level] ?? s.study_level}
                        </span>
                      )}
                      {badge && (
                        <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", badge.cls)}>
                          {badge.label}
                        </span>
                      )}
                    </div>
                    {(s.source_url ?? s.application_url) && (
                      <a
                        href={s.application_url ?? s.source_url ?? undefined}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => { fetch(`/api/scholarships/${s.id}/view`, { method: "POST" }).catch(() => {}); }}
                        className="inline-block mt-3 text-sm text-crimson-600 hover:text-crimson-700 font-medium"
                      >
                        {s.application_url ? "Learn more →" : "View official source →"}
                      </a>
                    )}
                  </motion.div>
                );
              })
            )}
          </div>
        )}

        {activeTab === "plans" && (
          <div className="space-y-4">
            <h2 className="font-display text-2xl text-navy-900 dark:text-white">Plans</h2>
            <div className={cn(
              "rounded-xl border p-4",
              subscriptionActive && daysLeft !== null && daysLeft < 7
                ? "bg-amber-50 dark:bg-amber-500/10 border-amber-300 dark:border-amber-500/30"
                : "bg-white dark:bg-navy-800 border-border"
            )}>
              {subscriptionActive && currentAccessClass ? (
                <p className="text-sm text-navy-600 dark:text-white/70">
                  Current plan: <span className="font-semibold">{currentAccessClass.name}</span>
                  {daysLeft !== null && <> — expires in {daysLeft} day{daysLeft === 1 ? "" : "s"}</>}
                </p>
              ) : (
                <p className="text-sm text-navy-500 dark:text-white/50">No active plan — pick one below to unlock more scholarships.</p>
              )}
            </div>

            {accessClasses.length === 0 || accessPeriods.length === 0 ? (
              <p className="text-sm text-navy-400 dark:text-white/30">Plans aren&apos;t available yet — check back soon.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...accessClasses].sort((a, b) => a.rank - b.rank).map((c, i, sorted) => {
                  const isCurrentTier = subscriptionActive && profile.current_access_class_id === c.id;
                  const isHighest = i === sorted.length - 1;
                  const unlockedCount = scholarshipCountByClassId[c.id] ?? freeScholarshipCount;
                  const periodsForTier = accessPeriods.filter((p) => accessClassPrices.some((pr) => pr.class_id === c.id && pr.period_id === p.id));
                  return (
                    <div
                      key={c.id}
                      className={cn(
                        "rounded-xl border p-5 space-y-3 relative",
                        isCurrentTier
                          ? "bg-white dark:bg-navy-800 border-2 border-crimson-500 shadow-elevated"
                          : "bg-white dark:bg-navy-800 border-border shadow-card"
                      )}
                    >
                      {isCurrentTier && (
                        <span className="absolute -top-3 left-5 bg-crimson-500 text-white text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full">
                          Current Plan
                        </span>
                      )}
                      {!isCurrentTier && isHighest && (
                        <span className="absolute -top-3 left-5 bg-amber-400 text-navy-900 text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full">
                          Most Access
                        </span>
                      )}
                      <h3 className="font-display text-lg text-navy-900 dark:text-white">{c.name}</h3>
                      {c.description && (
                        <p className="text-navy-500 dark:text-white/50 text-xs leading-relaxed">{c.description}</p>
                      )}
                      <p className="text-xs font-medium text-crimson-600 dark:text-crimson-400">
                        Unlocks {unlockedCount} scholarship{unlockedCount === 1 ? "" : "s"}
                      </p>
                      <div className="space-y-2 pt-1">
                        {periodsForTier.length === 0 && (
                          <p className="text-xs text-navy-400 dark:text-white/30">Pricing coming soon</p>
                        )}
                        {periodsForTier.map((p) => {
                          const price = accessClassPrices.find((pr) => pr.class_id === c.id && pr.period_id === p.id);
                          if (!price) return null;
                          const key = `${c.id}__${p.id}`;
                          return (
                            <button
                              key={p.id}
                              onClick={() => handleSubscribe(c.id, p.id)}
                              disabled={subscribingKey === key}
                              className="w-full flex items-center justify-between px-3 py-2 rounded-lg border border-border hover:bg-navy-50 dark:hover:bg-white/5 text-sm disabled:opacity-50"
                            >
                              <span className="text-navy-600 dark:text-white/70">{p.label}</span>
                              <span className="font-semibold text-navy-900 dark:text-white">
                                {subscribingKey === key ? "…" : `₦${price.price_naira.toLocaleString()}`}
                                {isCurrentTier ? " · Renew" : ""}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
