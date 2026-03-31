"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { cn, formatDate, formatDateTime } from "@/lib/utils";
import { toast } from "sonner";

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

interface Props {
  profile: ClientProfile;
  applications: Application[];
  payments: Payment[];
  consultations: Consultation[];
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
};

type Tab = "overview" | "profile" | "applications" | "consultations" | "payments";

export function ClientDashboard({ profile, applications, payments, consultations }: Props) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState<Partial<ClientProfile>>(profile);
  const [saving, setSaving] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);

  const upcomingConsultation = consultations.find(
    (c) => c.status === "scheduled" && new Date(`${c.scheduled_date}T${c.scheduled_time}`) >= new Date()
  );

  const totalPaid = payments.filter((p) => p.status === "paid").reduce((s, p) => s + p.amount, 0);
  const totalOwed = payments.filter((p) => p.status === "pending").reduce((s, p) => s + p.amount, 0);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const supabase = createClient();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db = supabase as any;
      const { error } = await db
        .from("client_profiles")
        .update({
          full_name: editData.full_name,
          phone: editData.phone,
          city: editData.city,
          country: editData.country,
          field_of_study: editData.field_of_study,
          graduation_year: editData.graduation_year,
        })
        .eq("id", profile.id);

      if (error) throw error;
      toast.success("Profile updated");
      setEditMode(false);
      router.refresh();
    } catch {
      toast.error("Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  const tabs: { id: Tab; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "profile", label: "My Profile" },
    { id: "applications", label: "Applications" },
    { id: "consultations", label: "Consultations" },
    { id: "payments", label: "Payments" },
  ];

  return (
    <div className="min-h-screen bg-cream dark:bg-navy-950">
      {/* Header */}
      <header className="bg-white dark:bg-navy-900 border-b border-border shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gold-500 rounded-lg flex items-center justify-center">
              <span className="font-display text-navy-900 font-bold text-base leading-none">M</span>
            </div>
            <span className="font-display text-navy-900 dark:text-white font-medium">My Dashboard</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-navy-100 dark:bg-navy-700 flex items-center justify-center text-xs font-semibold text-navy-700 dark:text-white">
                {profile.full_name.charAt(0)}
              </div>
              <span className="text-sm text-navy-600 dark:text-white/70">{profile.full_name.split(" ")[0]}</span>
            </div>
            <button onClick={handleSignOut} className="text-sm text-navy-400 dark:text-white/40 hover:text-navy-600 dark:hover:text-white/70 transition-colors">
              Sign out
            </button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white dark:bg-navy-900 border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex gap-1 overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "px-4 py-3.5 text-sm font-medium whitespace-nowrap border-b-2 transition-all",
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
        {/* OVERVIEW */}
        {activeTab === "overview" && (
          <>
            <h2 className="font-display text-2xl text-navy-900 dark:text-white">
              Welcome back, {profile.full_name.split(" ")[0]}
            </h2>

            {/* Quick stats */}
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

            {/* Next consultation */}
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

            {/* Payment status banner */}
            {totalOwed > 0 && (
              <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700/30 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="font-semibold text-orange-800 dark:text-orange-300">Payment due</p>
                  <p className="text-orange-600 dark:text-orange-400 text-sm">You have ₦{totalOwed.toLocaleString()} outstanding</p>
                </div>
                <button
                  onClick={() => setShowPayModal(true)}
                  className="px-5 py-2.5 bg-orange-600 text-white rounded-lg text-sm font-semibold hover:bg-orange-500 transition-colors whitespace-nowrap"
                >
                  Make Payment →
                </button>
              </div>
            )}

            {/* Active applications */}
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
                        {app.assigned_staff_name && (
                          <p className="text-navy-400 dark:text-white/30 text-xs mt-0.5">Handled by: {app.assigned_staff_name}</p>
                        )}
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

        {/* PROFILE */}
        {activeTab === "profile" && (
          <div className="bg-white dark:bg-navy-800 rounded-xl border border-border shadow-card">
            <div className="px-6 py-5 border-b border-border flex items-center justify-between">
              <h3 className="font-display text-lg text-navy-900 dark:text-white">Personal & Academic Details</h3>
              {!editMode ? (
                <button onClick={() => setEditMode(true)} className="text-sm text-gold-600 hover:text-gold-500 font-medium">Edit</button>
              ) : (
                <div className="flex gap-3">
                  <button onClick={() => setEditMode(false)} className="text-sm text-navy-400 dark:text-white/40 hover:text-navy-600">Cancel</button>
                  <button onClick={handleSaveProfile} disabled={saving} className="text-sm text-gold-600 hover:text-gold-500 font-medium disabled:opacity-50">
                    {saving ? "Saving…" : "Save"}
                  </button>
                </div>
              )}
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
              {[
                { label: "Full Name", key: "full_name", value: profile.full_name },
                { label: "Email", key: "email", value: profile.email, readonly: true },
                { label: "Phone", key: "phone", value: profile.phone },
                { label: "City", key: "city", value: profile.city },
                { label: "Country", key: "country", value: profile.country },
                { label: "Education Level", key: "education_level", value: profile.education_level, readonly: true },
                { label: "Field of Study", key: "field_of_study", value: profile.field_of_study },
                { label: "GPA / Percentage", key: "gpa_percentage", value: profile.gpa_percentage, readonly: true },
                { label: "Graduation Year", key: "graduation_year", value: profile.graduation_year },
                { label: "Service Type", key: "service_type", value: profile.service_type, readonly: true },
                { label: "Budget Range", key: "budget_range", value: profile.budget_range, readonly: true },
                { label: "Preferred Countries", key: "preferred_countries", value: profile.preferred_countries?.join(", "), readonly: true },
              ].map((field) => (
                <div key={field.key}>
                  <label className="block text-xs font-medium text-navy-500 dark:text-white/50 mb-1.5">{field.label}</label>
                  {editMode && !field.readonly ? (
                    <input
                      type="text"
                      value={(editData[field.key as keyof ClientProfile] as string) ?? ""}
                      onChange={(e) => setEditData({ ...editData, [field.key]: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-cream dark:bg-navy-700 text-navy-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-gold-400"
                    />
                  ) : (
                    <p className="text-navy-800 dark:text-white/80 text-sm">{field.value ?? <span className="text-navy-400 dark:text-white/30 italic">Not provided</span>}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* APPLICATIONS */}
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
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold uppercase tracking-wider text-gold-600 dark:text-gold-400 capitalize">{app.type}</span>
                      </div>
                      <h4 className="font-display text-lg text-navy-900 dark:text-white">{app.title}</h4>
                      <p className="text-navy-500 dark:text-white/50 text-xs mt-0.5">
                        {[app.institution, app.destination_country].filter(Boolean).join(" · ")}
                      </p>
                    </div>
                    <span className={cn("text-xs px-2.5 py-1 rounded-full font-medium shrink-0 mt-1", STATUS_BADGE[app.status] ?? "bg-gray-100 text-gray-600")}>
                      {app.status.replace(/_/g, " ")}
                    </span>
                  </div>

                  {/* Stages */}
                  {Array.isArray(app.stages) && app.stages.length > 0 && (
                    <div className="px-5 py-4">
                      <p className="text-xs font-medium text-navy-500 dark:text-white/50 mb-3 uppercase tracking-wider">Progress</p>
                      <div className="space-y-2.5">
                        {app.stages.map((stage, i) => (
                          <div key={i} className="flex items-center gap-3">
                            <div className={cn(
                              "w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-xs",
                              stage.status === "completed" ? "bg-green-500 text-white" : "bg-border dark:bg-white/10 text-navy-400"
                            )}>
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

                  {app.assigned_staff_name && (
                    <div className="px-5 pb-4 text-xs text-navy-400 dark:text-white/30">
                      Handled by <span className="font-medium text-navy-600 dark:text-white/60">{app.assigned_staff_name}</span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* CONSULTATIONS */}
        {activeTab === "consultations" && (
          <div className="space-y-4">
            <h2 className="font-display text-2xl text-navy-900 dark:text-white">Consultations</h2>
            {consultations.length === 0 ? (
              <div className="bg-white dark:bg-navy-800 rounded-xl border border-border shadow-card p-12 text-center">
                <div className="text-4xl mb-3">📅</div>
                <p className="text-navy-500 dark:text-white/50 text-sm mb-4">No consultations scheduled yet.</p>
                <a
                  href="/book"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-gold-500 text-navy-900 rounded-lg font-semibold text-sm hover:bg-gold-400 transition-colors"
                >
                  Book a Consultation →
                </a>
              </div>
            ) : (
              consultations.map((c) => (
                <div key={c.id} className="bg-white dark:bg-navy-800 rounded-xl border border-border shadow-card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={cn("text-xs px-2.5 py-0.5 rounded-full font-medium", STATUS_BADGE[c.status] ?? "bg-gray-100 text-gray-600")}>
                        {c.status}
                      </span>
                      {c.outcome && (
                        <span className="text-xs text-navy-400 dark:text-white/40 capitalize">{c.outcome.replace(/_/g, " ")}</span>
                      )}
                    </div>
                    <p className="text-navy-900 dark:text-white font-medium">{formatDate(c.scheduled_date)}</p>
                    <p className="text-navy-500 dark:text-white/40 text-sm">{c.scheduled_time} · {c.timezone}</p>
                  </div>
                  {c.meeting_link && c.status === "scheduled" && (
                    <a
                      href={c.meeting_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-gold-500 text-navy-900 rounded-lg text-sm font-semibold hover:bg-gold-400 transition-colors whitespace-nowrap"
                    >
                      Join Meeting →
                    </a>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* PAYMENTS */}
        {activeTab === "payments" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-2xl text-navy-900 dark:text-white">Payments</h2>
              {totalOwed > 0 && (
                <button
                  onClick={() => setShowPayModal(true)}
                  className="px-5 py-2.5 bg-gold-500 text-navy-900 rounded-xl font-semibold text-sm hover:bg-gold-400 transition-colors"
                >
                  Make Payment →
                </button>
              )}
            </div>

            {/* Summary */}
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

            {/* Payment history */}
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
                        <span className="font-medium text-navy-900 dark:text-white text-sm">
                          {p.currency} {p.amount.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Payment Modal */}
      {showPayModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-navy-800 rounded-2xl shadow-elevated border border-border w-full max-w-md p-6">
            <h3 className="font-display text-xl text-navy-900 dark:text-white mb-2">Make a Payment</h3>
            <p className="text-navy-500 dark:text-white/50 text-sm mb-6">
              Payment gateway integration coming soon. Please contact your advisor to arrange payment via bank transfer.
            </p>
            <div className="bg-cream dark:bg-navy-700 rounded-xl p-4 mb-5 text-sm">
              <p className="text-navy-700 dark:text-white/70 font-medium mb-1">Outstanding Balance</p>
              <p className="font-display text-2xl text-navy-900 dark:text-white">₦{totalOwed.toLocaleString()}</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowPayModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-border text-navy-600 dark:text-white/60 text-sm hover:bg-cream dark:hover:bg-navy-700 transition-colors"
              >
                Close
              </button>
              <a
                href="mailto:j.oarowolo@gmail.com?subject=Payment%20for%20MakeoverArena%20Services"
                className="flex-1 py-2.5 rounded-xl bg-gold-500 text-navy-900 text-sm font-semibold text-center hover:bg-gold-400 transition-colors"
              >
                Contact Advisor
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
