"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { cn, formatDate, formatDateTime } from "@/lib/utils";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
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
}

interface Application {
  id: string;
  type: string;
  title: string;
  destination_country: string | null;
  institution: string | null;
  status: string;
  current_stage: string | null;
  stages: { name: string; status: string; completed_at: string | null }[];
  assigned_staff_name: string | null;
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

interface Consultation {
  id: string;
  student_name: string;
  scheduled_date: string;
  scheduled_time: string;
  timezone: string;
  status: string;
  outcome: string | null;
  meeting_link: string | null;
}

interface Document {
  id: string;
  file_name: string;
  document_type: string;
  file_size: number | null;
  status: string;
  created_at: string;
  review_notes: string | null;
}

interface Agent {
  full_name: string;
  email: string;
  phone: string | null;
  whatsapp: string | null;
}

interface Props {
  profile: ClientProfile;
  applications: Application[];
  payments: Payment[];
  consultations: Consultation[];
  documents: Document[];
  clientId: string;
  agent?: Agent | null;
  documentsCompleted?: boolean;
  consultationBooked?: boolean;
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

const DOC_TYPE_LABELS: Record<string, string> = {
  transcript: "Academic Transcript",
  certificate: "Certificate",
  id: "ID Card",
  passport: "Passport",
  sop: "Statement of Purpose",
  lor: "Letter of Recommendation",
  cv: "CV / Résumé",
  test_scores: "Test Scores",
  financial: "Financial Documents",
  other: "Other",
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

type Tab = "overview" | "profile" | "applications" | "consultations" | "payments" | "documents" | "scholarships";

interface ScholarshipMatch {
  id: string;
  name: string;
  description: string | null;
  destination_country: string | null;
  amount: string | null;
  tuition_range: string | null;
  application_url: string | null;
}

export function ClientDashboard({ profile, applications, payments, consultations, documents, clientId, agent, documentsCompleted = false, consultationBooked = false }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState<Partial<ClientProfile>>(profile);
  const [saving, setSaving] = useState(false);
  const [payingId, setPayingId] = useState<string | null>(null);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [docType, setDocType] = useState("transcript");
  const [docList, setDocList] = useState<Document[]>(documents);
  const fileRef = useRef<HTMLInputElement>(null);
  const [scholarshipKind, setScholarshipKind] = useState<"scholarships" | "low_tuition" | null>(null);
  const [scholarshipMatches, setScholarshipMatches] = useState<ScholarshipMatch[]>([]);
  const [loadingScholarships, setLoadingScholarships] = useState(false);

  useEffect(() => {
    const isPassFail = Boolean(profile.is_pass_fail);
    if (!isPassFail && (!profile.gpa || !profile.gpa_scale)) return;
    setLoadingScholarships(true);
    const params = new URLSearchParams({ is_pass_fail: String(isPassFail) });
    if (!isPassFail) {
      params.set("gpa", String(profile.gpa));
      params.set("gpa_scale", String(profile.gpa_scale));
    }
    fetch(`/api/scholarships?${params.toString()}`)
      .then((res) => res.json())
      .then((data: { kind: "scholarships" | "low_tuition"; items: ScholarshipMatch[] }) => {
        setScholarshipKind(data.kind);
        setScholarshipMatches(data.items ?? []);
      })
      .finally(() => setLoadingScholarships(false));
  }, [profile.gpa, profile.gpa_scale, profile.is_pass_fail]);

  const upcomingConsultation = consultations.find(
    (c) => c.status === "scheduled" && new Date(`${c.scheduled_date}T${c.scheduled_time}`) >= new Date()
  );

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
        body: JSON.stringify({
          client_id: clientId,
          payment_id: payment.id,
          email: profile.email,
          amount: payment.amount,
          description: payment.description,
        }),
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

  const handleDocUpload = async () => {
    const file = fileRef.current?.files?.[0];
    if (!file) { toast.error("Please select a file"); return; }
    if (file.size > 10 * 1024 * 1024) { toast.error("File must be under 10MB"); return; }

    setUploadingDoc(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("client_id", clientId);
    formData.append("document_type", docType);

    try {
      const res = await fetch("/api/documents/upload", { method: "POST", body: formData });
      const data = (await res.json()) as { id?: string; file_name?: string; error?: string };
      if (!res.ok) {
        toast.error(data.error ?? "Upload failed");
        return;
      }
      toast.success("Document uploaded successfully");
      setDocList((prev) => [{
        id: data.id!,
        file_name: data.file_name!,
        document_type: docType,
        file_size: file.size,
        status: "pending_review",
        created_at: new Date().toISOString(),
        review_notes: null,
      }, ...prev]);
      if (fileRef.current) fileRef.current.value = "";
    } catch {
      toast.error("Upload failed. Please try again.");
    } finally {
      setUploadingDoc(false);
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
    { id: "applications", label: "Applications" },
    { id: "consultations", label: "Consultations" },
    { id: "payments", label: "Payments" },
    { id: "documents", label: "Documents" },
    { id: "scholarships", label: scholarshipKind === "low_tuition" ? "Low Tuition" : "Scholarships" },
  ];

  return (
    <div className="min-h-screen bg-cream dark:bg-navy-950">
      <header className="bg-white dark:bg-navy-900 border-b border-border shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gold-500 rounded-lg flex items-center justify-center">
              <span className="font-display text-navy-900 font-bold text-base leading-none">M</span>
            </div>
            <span className="font-display text-navy-900 dark:text-white font-medium">My Dashboard</span>
          </Link>
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
                    ? "border-gold-500 text-navy-900 dark:text-white"
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

            {/* Next steps banner — shown until both are done */}
            {(!documentsCompleted || !consultationBooked) && (
              <div className="bg-navy-900 rounded-xl p-5 border border-gold-500/20">
                <p className="text-xs font-semibold text-gold-400 uppercase tracking-wider mb-3">Next Steps</p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className={cn("w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-bold", documentsCompleted ? "bg-green-500 text-white" : "bg-white/10 text-white/50")}>
                      {documentsCompleted ? "✓" : "1"}
                    </div>
                    <div className="flex-1">
                      <p className={cn("text-sm font-medium", documentsCompleted ? "text-white/50 line-through" : "text-white")}>Upload your documents</p>
                      {!documentsCompleted && <p className="text-white/40 text-xs">Transcripts, passport, certificates etc.</p>}
                    </div>
                    {!documentsCompleted && (
                      <button onClick={() => setActiveTab("documents")} className="text-xs px-3 py-1.5 bg-gold-500 text-navy-900 rounded-lg font-semibold hover:bg-gold-400 transition-colors whitespace-nowrap">
                        Upload →
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={cn("w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-bold", consultationBooked ? "bg-green-500 text-white" : "bg-white/10 text-white/50")}>
                      {consultationBooked ? "✓" : "2"}
                    </div>
                    <div className="flex-1">
                      <p className={cn("text-sm font-medium", consultationBooked ? "text-white/50 line-through" : "text-white")}>Book your free consultation</p>
                      {!consultationBooked && <p className="text-white/40 text-xs">15-minute call with one of our advisors</p>}
                    </div>
                    {!consultationBooked && (
                      <a href="/book" className="text-xs px-3 py-1.5 bg-gold-500 text-navy-900 rounded-lg font-semibold hover:bg-gold-400 transition-colors whitespace-nowrap">
                        Book →
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "Applications", value: applications.length, icon: "📋" },
                { label: "Consultations", value: consultations.length, icon: "📅" },
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

            {upcomingConsultation && (
              <div className="bg-navy-900 rounded-xl p-6 border border-white/10">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-semibold text-gold-400 uppercase tracking-wider">Next Consultation</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <p className="text-white font-medium">{formatDate(upcomingConsultation.scheduled_date)}</p>
                    <p className="text-white/50 text-sm">{upcomingConsultation.scheduled_time} · {upcomingConsultation.timezone}</p>
                  </div>
                  {upcomingConsultation.meeting_link && (
                    <a
                      href={upcomingConsultation.meeting_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-gold-500 text-navy-900 rounded-lg text-sm font-semibold hover:bg-gold-400 transition-colors whitespace-nowrap"
                    >
                      Join Meeting →
                    </a>
                  )}
                </div>
              </div>
            )}

            {agent && (
              <div className="bg-white dark:bg-navy-800 rounded-xl p-6 border border-border shadow-card">
                <span className="text-xs font-semibold text-gold-600 dark:text-gold-400 uppercase tracking-wider">Your Agent</span>
                <p className="font-display text-lg text-navy-900 dark:text-white mt-1 mb-4">{agent.full_name}</p>
                <div className="flex flex-wrap gap-3">
                  <a
                    href={`mailto:${agent.email}`}
                    className="inline-flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-sm text-navy-700 dark:text-white/80 hover:bg-navy-50 dark:hover:bg-navy-700 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                    {agent.email}
                  </a>
                  {agent.phone && (
                    <a
                      href={`tel:${agent.phone}`}
                      className="inline-flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-sm text-navy-700 dark:text-white/80 hover:bg-navy-50 dark:hover:bg-navy-700 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                      Call
                    </a>
                  )}
                  {agent.whatsapp && (
                    <a
                      href={`https://wa.me/${agent.whatsapp.replace(/[^0-9]/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-500 transition-colors"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                      WhatsApp
                    </a>
                  )}
                </div>
              </div>
            )}

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

            {applications.length > 0 && (
              <div className="bg-white dark:bg-navy-800 rounded-xl border border-border shadow-card overflow-hidden">
                <div className="px-5 py-4 border-b border-border">
                  <h3 className="font-medium text-navy-900 dark:text-white">Active Applications</h3>
                </div>
                <div className="divide-y divide-border">
                  {applications.slice(0, 3).map((app) => (
                    <div key={app.id} className="px-5 py-4 flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <p className="text-navy-900 dark:text-white font-medium text-sm truncate">{app.title}</p>
                        <p className="text-navy-500 dark:text-white/40 text-xs capitalize">{app.type} · {app.destination_country ?? app.institution ?? "—"}</p>
                      </div>
                      <span className={cn("text-xs px-2.5 py-1 rounded-full font-medium shrink-0", STATUS_BADGE[app.status] ?? "bg-gray-100 text-gray-600")}>
                        {app.status.replace(/_/g, " ")}
                      </span>
                    </div>
                  ))}
                </div>
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
                <button onClick={() => setEditMode(true)} className="text-sm text-gold-600 hover:text-gold-500 font-medium">Edit</button>
              ) : (
                <div className="flex gap-3">
                  <button onClick={() => { setEditMode(false); setEditData(profile); }} className="text-sm text-navy-400 dark:text-white/40 hover:text-navy-600">Cancel</button>
                  <button onClick={handleSaveProfile} disabled={saving} className="text-sm text-gold-600 hover:text-gold-500 font-medium disabled:opacity-50">
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
                  <input type="text" value={editData.phone ?? ""} onChange={(e) => setEditData({ ...editData, phone: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-border bg-cream dark:bg-navy-700 text-navy-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-gold-400" />
                ) : (
                  <p className="text-navy-800 dark:text-white/80 text-sm">{profile.phone || <span className="text-navy-400 dark:text-white/30 italic">Not provided</span>}</p>
                )}
              </div>

              {/* City */}
              <div>
                <label className="block text-xs font-medium text-navy-500 dark:text-white/50 mb-1.5">City</label>
                {editMode ? (
                  <input type="text" value={editData.city ?? ""} onChange={(e) => setEditData({ ...editData, city: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-border bg-cream dark:bg-navy-700 text-navy-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-gold-400" />
                ) : (
                  <p className="text-navy-800 dark:text-white/80 text-sm">{profile.city || <span className="text-navy-400 dark:text-white/30 italic">Not provided</span>}</p>
                )}
              </div>

              {/* Country */}
              <div>
                <label className="block text-xs font-medium text-navy-500 dark:text-white/50 mb-1.5">Country</label>
                {editMode ? (
                  <input type="text" value={editData.country ?? ""} onChange={(e) => setEditData({ ...editData, country: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-border bg-cream dark:bg-navy-700 text-navy-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-gold-400" />
                ) : (
                  <p className="text-navy-800 dark:text-white/80 text-sm">{profile.country || <span className="text-navy-400 dark:text-white/30 italic">Not provided</span>}</p>
                )}
              </div>

              {/* Education Level */}
              <div>
                <label className="block text-xs font-medium text-navy-500 dark:text-white/50 mb-1.5">Education Level</label>
                {editMode ? (
                  <select value={editData.education_level ?? ""} onChange={(e) => setEditData({ ...editData, education_level: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-border bg-cream dark:bg-navy-700 text-navy-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-gold-400">
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
                  <input type="text" value={editData.field_of_study ?? ""} onChange={(e) => setEditData({ ...editData, field_of_study: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-border bg-cream dark:bg-navy-700 text-navy-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-gold-400" />
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
                          <select value={editData.gpa_scale ?? ""} onChange={(e) => setEditData({ ...editData, gpa_scale: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-border bg-cream dark:bg-navy-700 text-navy-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-gold-400">
                            <option value="">Select scale...</option>
                            {GPA_SCALE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-navy-500 dark:text-white/50 mb-1.5">GPA</label>
                          <input type="number" step="0.01" min="0" max={editData.gpa_scale === "5.0" ? 5 : 4} value={editData.gpa ?? ""} onChange={(e) => setEditData({ ...editData, gpa: e.target.value ? parseFloat(e.target.value) : null })} className="w-full px-3 py-2 rounded-lg border border-border bg-cream dark:bg-navy-700 text-navy-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-gold-400" />
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
                  <input type="number" min="1990" max="2030" value={editData.graduation_year ?? ""} onChange={(e) => setEditData({ ...editData, graduation_year: e.target.value ? parseInt(e.target.value) : null })} className="w-full px-3 py-2 rounded-lg border border-border bg-cream dark:bg-navy-700 text-navy-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-gold-400" />
                ) : (
                  <p className="text-navy-800 dark:text-white/80 text-sm">{profile.graduation_year ?? <span className="text-navy-400 dark:text-white/30 italic">Not provided</span>}</p>
                )}
              </div>

              {/* Service Type */}
              <div>
                <label className="block text-xs font-medium text-navy-500 dark:text-white/50 mb-1.5">Service Type</label>
                {editMode ? (
                  <select value={editData.service_type ?? ""} onChange={(e) => setEditData({ ...editData, service_type: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-border bg-cream dark:bg-navy-700 text-navy-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-gold-400">
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
                  <select value={editData.budget_range ?? ""} onChange={(e) => setEditData({ ...editData, budget_range: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-border bg-cream dark:bg-navy-700 text-navy-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-gold-400">
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
                        <label key={country} className={cn("flex items-center gap-2 px-3 py-2 rounded-lg border text-sm cursor-pointer transition-colors", selected ? "border-gold-500 bg-gold-50 dark:bg-gold-900/20 text-navy-900 dark:text-white" : "border-border text-navy-600 dark:text-white/60 hover:border-navy-300")}>
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

        {/* ── APPLICATIONS ── */}
        {activeTab === "applications" && (
          <div className="space-y-4">
            <h2 className="font-display text-2xl text-navy-900 dark:text-white">My Applications</h2>
            {applications.length === 0 ? (
              <div className="bg-white dark:bg-navy-800 rounded-xl border border-border shadow-card p-12 text-center">
                <div className="text-4xl mb-3">📋</div>
                <p className="text-navy-500 dark:text-white/50 text-sm">No applications yet. Your team will add your applications here once you&apos;re onboarded.</p>
              </div>
            ) : (
              applications.map((app) => (
                <div key={app.id} className="bg-white dark:bg-navy-800 rounded-xl border border-border shadow-card overflow-hidden">
                  <div className="px-5 py-4 flex items-start justify-between gap-4 border-b border-border">
                    <div>
                      <span className="text-xs font-semibold uppercase tracking-wider text-gold-600 dark:text-gold-400 capitalize">{app.type}</span>
                      <h4 className="font-display text-lg text-navy-900 dark:text-white">{app.title}</h4>
                      <p className="text-navy-500 dark:text-white/50 text-xs mt-0.5">
                        {[app.institution, app.destination_country].filter(Boolean).join(" · ")}
                      </p>
                    </div>
                    <span className={cn("text-xs px-2.5 py-1 rounded-full font-medium shrink-0 mt-1", STATUS_BADGE[app.status] ?? "bg-gray-100 text-gray-600")}>
                      {app.status.replace(/_/g, " ")}
                    </span>
                  </div>
                  {Array.isArray(app.stages) && app.stages.length > 0 && (
                    <div className="px-5 py-4">
                      <p className="text-xs font-medium text-navy-500 dark:text-white/50 mb-3 uppercase tracking-wider">Progress</p>
                      <div className="space-y-2.5">
                        {app.stages.map((stage, i) => (
                          <div key={i} className="flex items-center gap-3">
                            <div className={cn("w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-xs", stage.status === "completed" ? "bg-green-500 text-white" : "bg-border dark:bg-white/10 text-navy-400")}>
                              {stage.status === "completed" ? "✓" : i + 1}
                            </div>
                            <p className={cn("text-sm", stage.status === "completed" ? "text-navy-700 dark:text-white/80" : "text-navy-400 dark:text-white/40")}>
                              {stage.name}
                            </p>
                            {stage.completed_at && (
                              <span className="ml-auto text-xs text-navy-400 dark:text-white/30">{formatDate(stage.completed_at)}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* ── CONSULTATIONS ── */}
        {activeTab === "consultations" && (
          <div className="space-y-4">
            <h2 className="font-display text-2xl text-navy-900 dark:text-white">Consultations</h2>
            {consultations.length === 0 ? (
              <div className="bg-white dark:bg-navy-800 rounded-xl border border-border shadow-card p-12 text-center">
                <div className="text-4xl mb-3">📅</div>
                <p className="text-navy-500 dark:text-white/50 text-sm mb-4">No consultations scheduled yet.</p>
                <a href="/book" className="inline-flex items-center gap-2 px-5 py-2.5 bg-gold-500 text-navy-900 rounded-lg font-semibold text-sm hover:bg-gold-400 transition-colors">
                  Book a Consultation →
                </a>
              </div>
            ) : (
              consultations.map((c) => (
                <div key={c.id} className="bg-white dark:bg-navy-800 rounded-xl border border-border shadow-card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={cn("text-xs px-2.5 py-0.5 rounded-full font-medium", STATUS_BADGE[c.status] ?? "bg-gray-100 text-gray-600")}>{c.status}</span>
                      {c.outcome && <span className="text-xs text-navy-400 dark:text-white/40 capitalize">{c.outcome.replace(/_/g, " ")}</span>}
                    </div>
                    <p className="text-navy-900 dark:text-white font-medium">{formatDate(c.scheduled_date)}</p>
                    <p className="text-navy-500 dark:text-white/40 text-sm">{c.scheduled_time} · {c.timezone}</p>
                  </div>
                  {c.meeting_link && c.status === "scheduled" && (
                    <a href={c.meeting_link} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-gold-500 text-navy-900 rounded-lg text-sm font-semibold hover:bg-gold-400 transition-colors whitespace-nowrap">
                      Join Meeting →
                    </a>
                  )}
                </div>
              ))
            )}
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
                            className="text-xs px-3 py-1.5 bg-gold-500 text-navy-900 rounded-lg font-semibold hover:bg-gold-400 transition-colors disabled:opacity-60"
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

        {/* ── DOCUMENTS ── */}
        {activeTab === "documents" && (
          <div className="space-y-5">
            <h2 className="font-display text-2xl text-navy-900 dark:text-white">Documents</h2>

            <div className="bg-white dark:bg-navy-800 rounded-xl border border-border shadow-card p-6">
              <h3 className="font-medium text-navy-900 dark:text-white mb-1">Upload a Document</h3>
              <p className="text-navy-500 dark:text-white/50 text-xs mb-4">PDF, JPG, PNG — max 10MB</p>
              <div className="flex flex-col sm:flex-row gap-3">
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                  className="h-9 px-3 text-sm border border-border rounded-lg bg-navy-50 dark:bg-navy-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-gold-400"
                >
                  {Object.entries(DOC_TYPE_LABELS).map(([v, l]) => (
                    <option key={v} value={v}>{l}</option>
                  ))}
                </select>
                <input
                  ref={fileRef}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  className="flex-1 text-sm text-navy-600 dark:text-white/70 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-navy-900 file:text-white hover:file:bg-navy-800"
                />
                <button
                  onClick={handleDocUpload}
                  disabled={uploadingDoc}
                  className="px-4 py-2 bg-gold-500 text-navy-900 rounded-lg text-sm font-semibold hover:bg-gold-400 transition-colors disabled:opacity-60 whitespace-nowrap"
                >
                  {uploadingDoc ? "Uploading…" : "Upload"}
                </button>
              </div>
            </div>

            {docList.length === 0 ? (
              <div className="bg-white dark:bg-navy-800 rounded-xl border border-border shadow-card p-10 text-center">
                <div className="text-4xl mb-3">📄</div>
                <p className="text-navy-500 dark:text-white/50 text-sm">No documents uploaded yet. Upload your transcripts, certificates, and other required documents above.</p>
              </div>
            ) : (
              <div className="bg-white dark:bg-navy-800 rounded-xl border border-border shadow-card overflow-hidden">
                <div className="px-5 py-4 border-b border-border">
                  <h3 className="font-medium text-navy-900 dark:text-white">Uploaded Documents</h3>
                </div>
                <div className="divide-y divide-border">
                  {docList.map((doc) => (
                    <div key={doc.id} className="px-5 py-4 flex items-center gap-4">
                      <div className="w-9 h-9 rounded-lg bg-navy-100 dark:bg-navy-700 flex items-center justify-center shrink-0">
                        <svg className="w-4 h-4 text-navy-500 dark:text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-navy-900 dark:text-white text-sm font-medium truncate">{doc.file_name}</p>
                        <p className="text-navy-400 dark:text-white/30 text-xs">
                          {DOC_TYPE_LABELS[doc.document_type] ?? doc.document_type}
                          {doc.file_size && ` · ${(doc.file_size / 1024).toFixed(0)} KB`}
                          {" · "}{formatDate(doc.created_at)}
                        </p>
                        {doc.review_notes && (
                          <p className="text-xs text-orange-600 mt-0.5">{doc.review_notes}</p>
                        )}
                      </div>
                      <span className={cn("text-xs px-2.5 py-0.5 rounded-full font-medium shrink-0", STATUS_BADGE[doc.status] ?? "bg-gray-100 text-gray-600")}>
                        {doc.status.replace(/_/g, " ")}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── SCHOLARSHIPS / LOW TUITION ── */}
        {activeTab === "scholarships" && (
          <div className="space-y-4">
            <h2 className="font-display text-2xl text-navy-900 dark:text-white">
              {scholarshipKind === "low_tuition" ? "Low Tuition Packages" : "Matched Scholarships"}
            </h2>
            {loadingScholarships ? (
              <p className="text-navy-500 dark:text-white/50 text-sm">Loading matches…</p>
            ) : scholarshipMatches.length === 0 ? (
              <div className="bg-white dark:bg-navy-800 rounded-xl border border-border shadow-card p-12 text-center">
                <div className="text-4xl mb-3">🎓</div>
                <p className="text-navy-500 dark:text-white/50 text-sm">
                  {profile.gpa || profile.is_pass_fail
                    ? "No matches found yet. Your advisor will share options shortly."
                    : "Complete your academic info to see matched scholarships."}
                </p>
              </div>
            ) : (
              scholarshipMatches.map((s) => (
                <div key={s.id} className="bg-white dark:bg-navy-800 rounded-xl border border-border shadow-card p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h4 className="font-display text-lg text-navy-900 dark:text-white">{s.name}</h4>
                      <p className="text-navy-500 dark:text-white/50 text-xs mt-0.5">{s.destination_country}</p>
                      {s.description && <p className="text-navy-600 dark:text-white/60 text-sm mt-2">{s.description}</p>}
                    </div>
                    <span className="text-sm font-semibold text-gold-600 dark:text-gold-400 shrink-0">
                      {s.amount ?? s.tuition_range ?? ""}
                    </span>
                  </div>
                  {s.application_url && (
                    <a
                      href={s.application_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block mt-3 text-sm text-gold-600 hover:text-gold-700 font-medium"
                    >
                      Learn more →
                    </a>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
}
