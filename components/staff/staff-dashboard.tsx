"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils";
import { logoutStaffAction, approveStaffAction, updateAbilitiesAction } from "@/app/staff/login/actions";
import type { AdminSession, StaffAbility } from "@/lib/admin-auth";

type StaffRole = "super_admin" | "staff" | "admin";

interface StaffProfile {
  id: string;
  role: StaffRole | string;
  full_name: string;
  email: string;
  avatar_url?: string | null;
}

interface ClientRow {
  id: string;
  full_name: string;
  email: string;
  service_type: string | null;
  payment_status: string | null;
  created_at: string;
}

interface ConsultationRow {
  id: string;
  student_name: string;
  student_email: string;
  scheduled_date: string;
  scheduled_time: string;
  status: string;
  outcome: string | null;
}

interface InquiryRow {
  id: string;
  full_name: string;
  email: string;
  service_type: string;
  status: string;
  priority: string;
  created_at: string;
}

interface AnalyticsData {
  payments: { amount: number; status: string; currency: string; created_at: string }[];
  inquiryStats: { date: string; total_inquiries: number; conversions: number; conversion_rate: number }[];
  clientSignups: { created_at: string }[];
  agentStats: { staff_id: string; full_name: string; client_count: number }[];
}

interface StaffMember {
  id: string;
  full_name: string;
  email: string;
  role: string;
  is_active: boolean;
  is_pending: boolean;
  abilities: Record<string, boolean>;
  job_title?: string | null;
  created_at: string;
}

interface Props {
  staff: StaffProfile;
  session: AdminSession;
  clients: ClientRow[];
  consultations: ConsultationRow[];
  inquiries: InquiryRow[];
  analyticsData: AnalyticsData | null;
  staffList: StaffMember[] | null;
}

const STATUS_COLORS: Record<string, string> = {
  new: "bg-blue-100 text-blue-700",
  reviewed: "bg-yellow-100 text-yellow-700",
  contacted: "bg-purple-100 text-purple-700",
  consultation_booked: "bg-indigo-100 text-indigo-700",
  proposal_sent: "bg-orange-100 text-orange-700",
  client: "bg-green-100 text-green-700",
  lost: "bg-red-100 text-red-700",
  on_hold: "bg-gray-100 text-gray-600",
  scheduled: "bg-blue-100 text-blue-700",
  completed: "bg-green-100 text-green-700",
  no_show: "bg-red-100 text-red-700",
  cancelled: "bg-gray-100 text-gray-600",
  pending: "bg-yellow-100 text-yellow-700",
  paid: "bg-green-100 text-green-700",
  overdue: "bg-red-100 text-red-700",
  partial: "bg-orange-100 text-orange-700",
};

const ALL_ABILITIES: { key: StaffAbility; label: string }[] = [
  { key: "view_clients", label: "View Clients" },
  { key: "assign_agents", label: "Assign Agents" },
  { key: "manage_scholarships", label: "Manage Scholarships" },
  { key: "view_payments", label: "View Payments" },
  { key: "view_analytics", label: "View Analytics" },
];

type Tab = "overview" | "clients" | "consultations" | "analytics" | "team";

function can(session: AdminSession, ability: StaffAbility): boolean {
  if (session.role === "super_admin") return true;
  return Boolean(session.abilities?.[ability]);
}

export function StaffDashboard({ staff, session, clients, consultations, inquiries, analyticsData, staffList }: Props) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [expandedStaff, setExpandedStaff] = useState<string | null>(null);
  const [abilitiesDraft, setAbilitiesDraft] = useState<Record<string, Record<string, boolean>>>({});
  const [isPending, startTransition] = useTransition();

  const isSuperAdmin = session.role === "super_admin";
  const totalRevenue = analyticsData?.payments
    .filter((p) => p.status === "paid")
    .reduce((sum, p) => sum + p.amount, 0) ?? 0;

  const tabs: { id: Tab; label: string; show: boolean }[] = [
    { id: "overview", label: "Overview", show: true },
    { id: "clients", label: "Clients", show: can(session, "view_clients") },
    { id: "consultations", label: "Consultations", show: true },
    { id: "analytics", label: "Analytics", show: can(session, "view_analytics") },
    { id: "team", label: "Team", show: isSuperAdmin },
  ];

  function getAbilitiesDraft(member: StaffMember): Record<string, boolean> {
    return abilitiesDraft[member.id] ?? member.abilities ?? {};
  }

  function toggleAbility(memberId: string, ability: string, current: boolean) {
    setAbilitiesDraft((prev) => ({
      ...prev,
      [memberId]: { ...(prev[memberId] ?? {}), [ability]: !current },
    }));
  }

  function saveAbilities(member: StaffMember) {
    const abilities = getAbilitiesDraft(member);
    startTransition(async () => {
      await updateAbilitiesAction(member.id, abilities);
      router.refresh();
    });
  }

  function approveMember(memberId: string) {
    startTransition(async () => {
      await approveStaffAction(memberId);
      router.refresh();
    });
  }

  const pendingStaff = (staffList ?? []).filter((s) => s.is_pending || !s.is_active);
  const activeStaff = (staffList ?? []).filter((s) => !s.is_pending && s.is_active);

  return (
    <div className="min-h-screen bg-navy-950">
      <header className="border-b border-white/10 bg-navy-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gold-500 rounded-lg flex items-center justify-center">
              <span className="font-display text-navy-900 font-bold text-base">M</span>
            </div>
            <span className="font-display text-white font-medium">Staff Portal</span>
            <span className="hidden sm:block px-2 py-0.5 bg-gold-500/10 text-gold-400 text-xs rounded-full border border-gold-500/20">
              {isSuperAdmin ? "Super Admin" : "Staff"}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden sm:block text-sm text-white/60">{staff.full_name}</span>
            <form action={logoutStaffAction}>
              <button type="submit" className="text-xs text-white/40 hover:text-white/70 transition-colors">
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="border-b border-white/10 bg-navy-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex gap-1 overflow-x-auto">
            {tabs.filter((t) => t.show).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "px-4 py-3.5 text-sm font-medium whitespace-nowrap border-b-2 transition-all",
                  activeTab === tab.id
                    ? "border-gold-400 text-gold-400"
                    : "border-transparent text-white/50 hover:text-white/80"
                )}
              >
                {tab.label}
                {tab.id === "team" && pendingStaff.length > 0 && (
                  <span className="ml-1.5 px-1.5 py-0.5 bg-red-500 text-white text-xs rounded-full">
                    {pendingStaff.length}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* OVERVIEW */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <h2 className="font-display text-2xl text-white">Overview</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "Inquiries", value: inquiries.length, color: "text-blue-400" },
                { label: "Consultations", value: consultations.length, color: "text-purple-400" },
                ...(can(session, "view_clients") ? [{ label: "Clients", value: clients.length, color: "text-green-400" }] : []),
                ...(can(session, "view_payments") ? [{ label: "Revenue", value: `₦${totalRevenue.toLocaleString()}`, color: "text-gold-400" }] : []),
              ].map((stat) => (
                <div key={stat.label} className="bg-navy-800 rounded-xl p-5 border border-white/10">
                  <div className={cn("font-display text-2xl font-light mb-1", stat.color)}>{stat.value}</div>
                  <div className="text-white/50 text-sm">{stat.label}</div>
                </div>
              ))}
            </div>

            <div className="bg-navy-800 rounded-xl border border-white/10 overflow-hidden">
              <div className="px-5 py-4 border-b border-white/10">
                <h3 className="text-white font-medium">Recent Inquiries</h3>
              </div>
              <div className="divide-y divide-white/5">
                {inquiries.slice(0, 8).map((inq) => (
                  <div key={inq.id} className="px-5 py-3.5 flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-white text-sm font-medium truncate">{inq.full_name}</p>
                      <p className="text-white/40 text-xs truncate">{inq.email} · {inq.service_type}</p>
                    </div>
                    <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium shrink-0", STATUS_COLORS[inq.status] ?? "bg-white/10 text-white/60")}>
                      {inq.status.replace(/_/g, " ")}
                    </span>
                  </div>
                ))}
                {inquiries.length === 0 && (
                  <p className="px-5 py-8 text-center text-white/30 text-sm">No inquiries yet</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* CLIENTS */}
        {activeTab === "clients" && can(session, "view_clients") && (
          <div className="space-y-4">
            <h2 className="font-display text-2xl text-white">Clients</h2>
            <div className="bg-navy-800 rounded-xl border border-white/10 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="px-5 py-3.5 text-left text-white/50 font-medium">Name</th>
                      <th className="px-5 py-3.5 text-left text-white/50 font-medium">Service</th>
                      <th className="px-5 py-3.5 text-left text-white/50 font-medium">Payment</th>
                      <th className="px-5 py-3.5 text-left text-white/50 font-medium">Joined</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {clients.map((c) => (
                      <tr key={c.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-5 py-3.5">
                          <p className="text-white font-medium">{c.full_name}</p>
                          <p className="text-white/40 text-xs">{c.email}</p>
                        </td>
                        <td className="px-5 py-3.5 text-white/60 capitalize">{c.service_type ?? "—"}</td>
                        <td className="px-5 py-3.5">
                          <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", STATUS_COLORS[c.payment_status ?? "pending"] ?? "bg-white/10 text-white/60")}>
                            {c.payment_status ?? "pending"}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-white/40 text-xs">{formatDate(c.created_at)}</td>
                      </tr>
                    ))}
                    {clients.length === 0 && (
                      <tr><td colSpan={4} className="px-5 py-10 text-center text-white/30">No clients yet</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* CONSULTATIONS */}
        {activeTab === "consultations" && (
          <div className="space-y-4">
            <h2 className="font-display text-2xl text-white">Consultations</h2>
            <div className="bg-navy-800 rounded-xl border border-white/10 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="px-5 py-3.5 text-left text-white/50 font-medium">Student</th>
                      <th className="px-5 py-3.5 text-left text-white/50 font-medium">Date</th>
                      <th className="px-5 py-3.5 text-left text-white/50 font-medium">Status</th>
                      <th className="px-5 py-3.5 text-left text-white/50 font-medium">Outcome</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {consultations.map((c) => (
                      <tr key={c.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-5 py-3.5">
                          <p className="text-white font-medium">{c.student_name}</p>
                          <p className="text-white/40 text-xs">{c.student_email}</p>
                        </td>
                        <td className="px-5 py-3.5 text-white/60">
                          {formatDate(c.scheduled_date)} at {c.scheduled_time}
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", STATUS_COLORS[c.status] ?? "bg-white/10 text-white/60")}>
                            {c.status}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-white/40 text-xs capitalize">
                          {c.outcome?.replace(/_/g, " ") ?? "—"}
                        </td>
                      </tr>
                    ))}
                    {consultations.length === 0 && (
                      <tr><td colSpan={4} className="px-5 py-10 text-center text-white/30">No consultations yet</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ANALYTICS */}
        {activeTab === "analytics" && can(session, "view_analytics") && analyticsData && (
          <div className="space-y-6">
            <h2 className="font-display text-2xl text-white">Analytics</h2>

            {/* Summary stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "Total Revenue", value: `₦${analyticsData.payments.filter((p) => p.status === "paid").reduce((s, p) => s + p.amount, 0).toLocaleString()}` },
                { label: "Pending Payments", value: analyticsData.payments.filter((p) => p.status === "pending").length },
                { label: "Total Clients", value: clients.length },
                { label: "Total Signups", value: analyticsData.clientSignups.length },
              ].map((stat) => (
                <div key={stat.label} className="bg-navy-800 rounded-xl p-5 border border-white/10">
                  <div className="font-display text-2xl font-light text-gold-400 mb-1">{stat.value}</div>
                  <div className="text-white/50 text-sm">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Application funnel */}
            <div className="bg-navy-800 rounded-xl border border-white/10 p-5">
              <h3 className="text-white font-medium mb-4">Application Funnel</h3>
              {[
                { label: "Signed Up", value: analyticsData.clientSignups.length },
                { label: "Consultation Booked", value: consultations.length },
                { label: "Paid", value: analyticsData.payments.filter((p) => p.status === "paid").length },
              ].map((step, i) => {
                const total = analyticsData.clientSignups.length || 1;
                const pct = Math.round((step.value / total) * 100);
                return (
                  <div key={i} className="mb-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-white/70">{step.label}</span>
                      <span className="text-white/40">{step.value} ({pct}%)</span>
                    </div>
                    <div className="h-1.5 bg-white/10 rounded-full">
                      <div className="h-full bg-gold-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Agent performance */}
            {analyticsData.agentStats.length > 0 && (
              <div className="bg-navy-800 rounded-xl border border-white/10 p-5">
                <h3 className="text-white font-medium mb-4">Agent Performance</h3>
                <div className="divide-y divide-white/5">
                  {analyticsData.agentStats.sort((a, b) => b.client_count - a.client_count).map((a) => (
                    <div key={a.staff_id} className="py-3 flex justify-between items-center">
                      <span className="text-white/70 text-sm">{a.full_name}</span>
                      <span className="text-gold-400 font-medium text-sm">{a.client_count} clients</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Revenue breakdown */}
            <div className="bg-navy-800 rounded-xl border border-white/10 p-5">
              <h3 className="text-white font-medium mb-4">Recent Payments</h3>
              <div className="divide-y divide-white/5">
                {analyticsData.payments.slice(0, 10).map((p, i) => (
                  <div key={i} className="py-3 flex justify-between items-center">
                    <span className="text-white/60 text-sm">{formatDate(p.created_at)}</span>
                    <div className="flex items-center gap-3">
                      <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", STATUS_COLORS[p.status] ?? "bg-white/10 text-white/60")}>
                        {p.status}
                      </span>
                      <span className="text-white font-medium text-sm">
                        {p.currency} {p.amount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
                {analyticsData.payments.length === 0 && (
                  <p className="py-8 text-center text-white/30 text-sm">No payments yet</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TEAM (super_admin only) */}
        {activeTab === "team" && isSuperAdmin && (
          <div className="space-y-6">
            <h2 className="font-display text-2xl text-white">Team Management</h2>

            {/* Pending approvals */}
            {pendingStaff.length > 0 && (
              <div className="bg-navy-800 rounded-xl border border-yellow-500/20 overflow-hidden">
                <div className="px-5 py-4 border-b border-white/10 flex items-center gap-2">
                  <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                  <h3 className="text-white font-medium">Pending Approval ({pendingStaff.length})</h3>
                </div>
                <div className="divide-y divide-white/5">
                  {pendingStaff.map((s) => (
                    <div key={s.id} className="px-5 py-4 flex items-center justify-between gap-4">
                      <div>
                        <p className="text-white font-medium">{s.full_name}</p>
                        <p className="text-white/40 text-xs">{s.email} · {s.job_title ?? "No title"} · Joined {formatDate(s.created_at)}</p>
                      </div>
                      <button
                        onClick={() => approveMember(s.id)}
                        disabled={isPending}
                        className="px-4 py-2 bg-gold-500 text-navy-900 rounded-lg font-semibold text-xs hover:bg-gold-400 transition-colors disabled:opacity-60 shrink-0"
                      >
                        Approve
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Active staff with ability toggles */}
            <div className="bg-navy-800 rounded-xl border border-white/10 overflow-hidden">
              <div className="px-5 py-4 border-b border-white/10">
                <h3 className="text-white font-medium">Active Staff ({activeStaff.length})</h3>
              </div>
              <div className="divide-y divide-white/5">
                {activeStaff.map((s) => {
                  const isExpanded = expandedStaff === s.id;
                  const draft = getAbilitiesDraft(s);
                  const isSA = s.role === "super_admin";
                  return (
                    <div key={s.id}>
                      <button
                        onClick={() => setExpandedStaff(isExpanded ? null : s.id)}
                        className="w-full px-5 py-4 flex items-center justify-between gap-4 hover:bg-white/5 transition-colors text-left"
                      >
                        <div>
                          <p className="text-white font-medium">{s.full_name}</p>
                          <p className="text-white/40 text-xs">{s.email} · {s.job_title ?? s.role}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {isSA && (
                            <span className="px-2 py-0.5 bg-gold-500/10 text-gold-400 text-xs rounded-full border border-gold-500/20">
                              Super Admin
                            </span>
                          )}
                          {!isSA && (
                            <span className="text-xs text-white/30">
                              {Object.values(draft).filter(Boolean).length}/{ALL_ABILITIES.length} abilities
                            </span>
                          )}
                          <svg className={cn("w-4 h-4 text-white/30 transition-transform", isExpanded && "rotate-180")} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </button>

                      {isExpanded && !isSA && (
                        <div className="px-5 pb-5 border-t border-white/5 pt-4">
                          <p className="text-white/50 text-xs mb-3 uppercase tracking-wide font-semibold">Abilities</p>
                          <div className="space-y-2 mb-4">
                            {ALL_ABILITIES.map(({ key, label }) => (
                              <label key={key} className="flex items-center gap-3 cursor-pointer group">
                                <div
                                  onClick={() => toggleAbility(s.id, key, Boolean(draft[key]))}
                                  className={cn(
                                    "w-9 h-5 rounded-full transition-colors relative flex-shrink-0 cursor-pointer",
                                    draft[key] ? "bg-gold-500" : "bg-white/10"
                                  )}
                                >
                                  <span className={cn(
                                    "absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform",
                                    draft[key] ? "translate-x-4" : "translate-x-0.5"
                                  )} />
                                </div>
                                <span className="text-sm text-white/70 group-hover:text-white transition-colors">{label}</span>
                              </label>
                            ))}
                          </div>
                          <button
                            onClick={() => saveAbilities(s)}
                            disabled={isPending}
                            className="px-4 py-2 bg-gold-500 text-navy-900 rounded-lg font-semibold text-xs hover:bg-gold-400 transition-colors disabled:opacity-60"
                          >
                            {isPending ? "Saving…" : "Save Abilities"}
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
                {activeStaff.length === 0 && (
                  <p className="px-5 py-8 text-center text-white/30 text-sm">No active staff yet</p>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
