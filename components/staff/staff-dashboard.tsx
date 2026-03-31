"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils";

type StaffRole = "admin" | "consultant" | "viewer" | "consultation_admin" | "business_admin" | "site_admin";

interface StaffProfile {
  id: string;
  role: StaffRole;
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
}

interface StaffMember {
  id: string;
  full_name: string;
  email: string;
  role: string;
  created_at: string;
}

interface Props {
  staff: StaffProfile;
  clients: ClientRow[];
  consultations: ConsultationRow[];
  inquiries: InquiryRow[];
  analyticsData: AnalyticsData | null;
  staffList: StaffMember[] | null;
}

const ROLE_LABELS: Record<StaffRole | string, string> = {
  admin: "Admin",
  consultant: "Consultant",
  viewer: "Viewer",
  consultation_admin: "Consultation Admin",
  business_admin: "Business Admin",
  site_admin: "Site Admin",
};

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

type Tab = "overview" | "clients" | "consultations" | "analytics" | "team";

export function StaffDashboard({ staff, clients, consultations, inquiries, analyticsData, staffList }: Props) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<StaffRole>("consultation_admin");
  const [inviting, setInviting] = useState(false);

  const canAccessAnalytics = ["business_admin", "site_admin", "admin"].includes(staff.role);
  const canManageTeam = ["site_admin", "admin"].includes(staff.role);

  const totalRevenue = analyticsData?.payments
    .filter((p) => p.status === "paid")
    .reduce((sum, p) => sum + p.amount, 0) ?? 0;

  const tabs: { id: Tab; label: string; show: boolean }[] = [
    { id: "overview", label: "Overview", show: true },
    { id: "clients", label: "Clients", show: true },
    { id: "consultations", label: "Consultations", show: true },
    { id: "analytics", label: "Analytics", show: canAccessAnalytics },
    { id: "team", label: "Team", show: canManageTeam },
  ];

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/staff/login");
  };

  const handleInviteStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviting(true);
    try {
      const res = await fetch("/api/staff/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
      });
      if (!res.ok) throw new Error("Failed to invite");
      setInviteEmail("");
      router.refresh();
    } catch {
      // handle error
    } finally {
      setInviting(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy-950">
      {/* Header */}
      <header className="border-b border-white/10 bg-navy-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gold-500 rounded-lg flex items-center justify-center">
              <span className="font-display text-navy-900 font-bold text-base">M</span>
            </div>
            <span className="font-display text-white font-medium">Staff Portal</span>
            <span className="hidden sm:block px-2 py-0.5 bg-gold-500/10 text-gold-400 text-xs rounded-full border border-gold-500/20">
              {ROLE_LABELS[staff.role]}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden sm:block text-sm text-white/60">{staff.full_name}</span>
            <button
              onClick={handleSignOut}
              className="text-sm text-white/40 hover:text-white/70 transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="border-b border-white/10 bg-navy-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex gap-1 overflow-x-auto scrollbar-hide">
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
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* OVERVIEW */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <h2 className="font-display text-2xl text-white">Overview</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "Total Inquiries", value: inquiries.length, color: "text-blue-400" },
                { label: "Active Clients", value: clients.length, color: "text-green-400" },
                { label: "Consultations", value: consultations.length, color: "text-purple-400" },
                ...(canAccessAnalytics
                  ? [{ label: "Revenue (NGN)", value: `₦${totalRevenue.toLocaleString()}`, color: "text-gold-400" }]
                  : []),
              ].map((stat) => (
                <div key={stat.label} className="bg-navy-800 rounded-xl p-5 border border-white/10">
                  <div className={cn("font-display text-2xl font-light mb-1", stat.color)}>{stat.value}</div>
                  <div className="text-white/50 text-sm">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Recent Inquiries */}
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
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", STATUS_COLORS[inq.status] ?? "bg-white/10 text-white/60")}>
                        {inq.status.replace("_", " ")}
                      </span>
                    </div>
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
        {activeTab === "clients" && (
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

        {/* ANALYTICS — business_admin + site_admin */}
        {activeTab === "analytics" && canAccessAnalytics && analyticsData && (
          <div className="space-y-6">
            <h2 className="font-display text-2xl text-white">Analytics</h2>

            {/* Finance summary */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  label: "Total Revenue",
                  value: `₦${analyticsData.payments.filter((p) => p.status === "paid").reduce((s, p) => s + p.amount, 0).toLocaleString()}`,
                },
                {
                  label: "Pending Payments",
                  value: analyticsData.payments.filter((p) => p.status === "pending").length,
                },
                {
                  label: "Total Clients",
                  value: clients.length,
                },
                {
                  label: "Conversion Rate",
                  value: inquiries.filter((i) => i.status === "client").length
                    ? `${Math.round((inquiries.filter((i) => i.status === "client").length / inquiries.length) * 100)}%`
                    : "0%",
                },
              ].map((stat) => (
                <div key={stat.label} className="bg-navy-800 rounded-xl p-5 border border-white/10">
                  <div className="font-display text-2xl font-light text-gold-400 mb-1">{stat.value}</div>
                  <div className="text-white/50 text-sm">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Service breakdown */}
            <div className="bg-navy-800 rounded-xl border border-white/10 p-5">
              <h3 className="text-white font-medium mb-4">Inquiries by Service Type</h3>
              {["undergraduate", "graduate", "scholarship", "visa", "phd"].map((service) => {
                const count = inquiries.filter((i) => i.service_type === service).length;
                const pct = inquiries.length > 0 ? Math.round((count / inquiries.length) * 100) : 0;
                return (
                  <div key={service} className="mb-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-white/70 capitalize">{service}</span>
                      <span className="text-white/40">{count} ({pct}%)</span>
                    </div>
                    <div className="h-1.5 bg-white/10 rounded-full">
                      <div className="h-full bg-gold-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Payment trend */}
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
                  <p className="py-8 text-center text-white/30 text-sm">No payment data yet</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TEAM — site_admin only */}
        {activeTab === "team" && canManageTeam && (
          <div className="space-y-6">
            <h2 className="font-display text-2xl text-white">Team Management</h2>

            {/* Invite staff */}
            <div className="bg-navy-800 rounded-xl border border-white/10 p-5">
              <h3 className="text-white font-medium mb-4">Invite Staff Member</h3>
              <form onSubmit={handleInviteStaff} className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="staff@makeoverarena.com"
                  required
                  className="flex-1 px-4 py-2.5 rounded-xl bg-navy-700 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-gold-400 text-sm"
                />
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as StaffRole)}
                  className="px-4 py-2.5 rounded-xl bg-navy-700 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-gold-400 text-sm"
                >
                  <option value="consultation_admin">Consultation Admin</option>
                  <option value="business_admin">Business Admin</option>
                  <option value="site_admin">Site Admin</option>
                </select>
                <button
                  type="submit"
                  disabled={inviting}
                  className="px-5 py-2.5 bg-gold-500 text-navy-900 rounded-xl font-semibold text-sm hover:bg-gold-400 transition-colors disabled:opacity-50 whitespace-nowrap"
                >
                  {inviting ? "Inviting…" : "Send Invite"}
                </button>
              </form>
            </div>

            {/* Staff list */}
            <div className="bg-navy-800 rounded-xl border border-white/10 overflow-hidden">
              <div className="px-5 py-4 border-b border-white/10">
                <h3 className="text-white font-medium">Staff Members ({staffList?.length ?? 0})</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="px-5 py-3.5 text-left text-white/50 font-medium">Name</th>
                      <th className="px-5 py-3.5 text-left text-white/50 font-medium">Role</th>
                      <th className="px-5 py-3.5 text-left text-white/50 font-medium">Joined</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {(staffList ?? []).map((s) => (
                      <tr key={s.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-5 py-3.5">
                          <p className="text-white font-medium">{s.full_name}</p>
                          <p className="text-white/40 text-xs">{s.email}</p>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="px-2.5 py-1 bg-gold-500/10 text-gold-400 text-xs rounded-full border border-gold-500/20">
                            {ROLE_LABELS[s.role] ?? s.role}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-white/40 text-xs">{formatDate(s.created_at)}</td>
                      </tr>
                    ))}
                    {(!staffList || staffList.length === 0) && (
                      <tr><td colSpan={3} className="px-5 py-10 text-center text-white/30">No staff members found</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
