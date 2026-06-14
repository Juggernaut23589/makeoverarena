import type { Metadata } from "next";
import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase";

export const metadata: Metadata = {
  title: "Dashboard | Admin",
};

const statusColors: Record<string, string> = {
  new: "bg-blue-100 text-blue-700",
  reviewed: "bg-yellow-100 text-yellow-700",
  contacted: "bg-purple-100 text-purple-700",
  consultation_booked: "bg-green-100 text-green-700",
  proposal_sent: "bg-orange-100 text-orange-700",
  client: "bg-emerald-100 text-emerald-700",
};

const statusLabels: Record<string, string> = {
  new: "New",
  reviewed: "Reviewed",
  contacted: "Contacted",
  consultation_booked: "Consult Booked",
  proposal_sent: "Proposal Sent",
  client: "Client",
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(diff / 86400000);
  if (h < 1) return "Just now";
  if (h < 24) return `${h}h ago`;
  if (d === 1) return "Yesterday";
  return `${d} days ago`;
}

function formatTime(time: string) {
  const [h, m] = time.split(":");
  const hour = Number(h);
  return `${hour % 12 || 12}:${m} ${hour >= 12 ? "PM" : "AM"}`;
}

function formatDateLabel(dateStr: string) {
  const today = new Date().toISOString().slice(0, 10);
  const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
  if (dateStr === today) return "Today";
  if (dateStr === tomorrow) return "Tomorrow";
  return new Date(dateStr).toLocaleDateString("en-NG", { month: "short", day: "numeric" });
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export default async function AdminDashboard() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const todayStr = now.toISOString().slice(0, 10);

  const [
    { count: inquiryCount },
    { count: inquiryLastMonth },
    { count: consultCount },
    { data: recentInquiries },
    { data: upcomingConsultations },
    { data: funnelRaw },
    { count: activeClients },
  ] = await Promise.all([
    supabaseAdmin?.from("inquiries").select("*", { count: "exact", head: true }).gte("created_at", startOfMonth) ?? Promise.resolve({ count: 0 }),
    supabaseAdmin?.from("inquiries").select("*", { count: "exact", head: true }).gte("created_at", new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString()).lt("created_at", startOfMonth) ?? Promise.resolve({ count: 0 }),
    supabaseAdmin?.from("consultations").select("*", { count: "exact", head: true }).gte("created_at", startOfWeek) ?? Promise.resolve({ count: 0 }),
    supabaseAdmin?.from("inquiries").select("id, full_name, service_type, preferred_countries, status, priority, created_at").order("created_at", { ascending: false }).limit(5) ?? Promise.resolve({ data: [] }),
    supabaseAdmin?.from("consultations").select("id, student_name, scheduled_date, scheduled_time, inquiry_id").eq("status", "scheduled").gte("scheduled_date", todayStr).order("scheduled_date").order("scheduled_time").limit(3) ?? Promise.resolve({ data: [] }),
    supabaseAdmin?.from("inquiries").select("status").gte("created_at", startOfMonth) ?? Promise.resolve({ data: [] }),
    supabaseAdmin?.from("inquiries").select("*", { count: "exact", head: true }).eq("status", "client") ?? Promise.resolve({ count: 0 }),
  ]);

  const thisMonth = inquiryCount ?? 0;
  const lastMonth = inquiryLastMonth ?? 0;
  const pctChange = lastMonth > 0 ? Math.round(((thisMonth - lastMonth) / lastMonth) * 100) : 0;

  const funnel = {
    new: 0, reviewed: 0, contacted: 0, consultation_booked: 0, client: 0,
  };
  for (const row of (funnelRaw ?? []) as Array<{ status: string }>) {
    const s = row.status as keyof typeof funnel;
    if (s in funnel) funnel[s]++;
  }
  const funnelTotal = thisMonth || 1;

  const stats = [
    {
      label: "Inquiries This Month",
      value: String(thisMonth),
      change: lastMonth > 0 ? `${pctChange >= 0 ? "+" : ""}${pctChange}% vs last month` : "—",
      positive: pctChange >= 0,
      color: "text-blue-600 bg-blue-50",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      label: "Consultations This Week",
      value: String(consultCount ?? 0),
      change: "Last 7 days",
      positive: true,
      color: "text-purple-600 bg-purple-50",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      label: "Conversion Rate",
      value: thisMonth > 0 ? `${Math.round((funnel.client / funnelTotal) * 100)}%` : "0%",
      change: "Inquiry → client",
      positive: true,
      color: "text-green-600 bg-green-50",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
    },
    {
      label: "Active Clients",
      value: String(activeClients ?? 0),
      change: "All time",
      positive: true,
      color: "text-gold-600 bg-gold-50",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0M7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
    },
  ];

  const funnelStages = [
    { label: "New Inquiries", value: thisMonth, pct: 100, color: "bg-blue-200" },
    { label: "Reviewed", value: funnel.reviewed + funnel.contacted + funnel.consultation_booked + funnel.client, pct: Math.round(((funnel.reviewed + funnel.contacted + funnel.consultation_booked + funnel.client) / funnelTotal) * 100), color: "bg-purple-200" },
    { label: "Contacted", value: funnel.contacted + funnel.consultation_booked + funnel.client, pct: Math.round(((funnel.contacted + funnel.consultation_booked + funnel.client) / funnelTotal) * 100), color: "bg-yellow-200" },
    { label: "Consultation", value: funnel.consultation_booked + funnel.client, pct: Math.round(((funnel.consultation_booked + funnel.client) / funnelTotal) * 100), color: "bg-orange-200" },
    { label: "Client", value: funnel.client, pct: Math.round((funnel.client / funnelTotal) * 100), color: "bg-green-200" },
  ];

  return (
    <div className="p-6 lg:p-8 max-w-screen-xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl text-navy-900">Dashboard</h1>
          <p className="text-navy-500 text-sm mt-1">
            {now.toLocaleDateString("en-NG", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>
        <Link
          href="/apply"
          target="_blank"
          className="hidden sm:inline-flex items-center gap-2 px-4 py-2 border border-navy-200 text-navy-700 rounded-lg text-sm hover:bg-navy-50 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          View Site
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl shadow-card p-5">
            <div className="flex items-start justify-between mb-3">
              <div className={cn("p-2 rounded-lg", stat.color)}>
                {stat.icon}
              </div>
              <span className={cn("text-xs font-medium", stat.positive ? "text-green-600" : "text-red-500")}>
                {stat.change}
              </span>
            </div>
            <div className="font-display text-2xl text-navy-900 font-medium">{stat.value}</div>
            <div className="text-navy-500 text-xs mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-card">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <h2 className="font-semibold text-navy-900">Recent Inquiries</h2>
            <Link href="/admin/inquiries" className="text-sm text-gold-600 hover:text-gold-700 font-medium">
              View all →
            </Link>
          </div>
          <div className="divide-y divide-border">
            {(recentInquiries ?? []).length === 0 && (
              <p className="px-6 py-8 text-center text-navy-400 text-sm">No inquiries yet.</p>
            )}
            {(recentInquiries as Array<{ id: string; full_name: string; service_type: string; preferred_countries: string[]; status: string; priority: string; created_at: string }> ?? []).map((inquiry) => (
              <div key={inquiry.id} className="flex items-center gap-4 px-6 py-4 hover:bg-navy-50/50 transition-colors">
                <div className="w-9 h-9 rounded-full bg-navy-100 flex items-center justify-center text-navy-600 font-semibold text-sm shrink-0">
                  {inquiry.full_name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-navy-900 text-sm">{inquiry.full_name}</div>
                  <div className="text-navy-500 text-xs">{inquiry.service_type} · {(inquiry.preferred_countries as string[]).slice(0, 2).join(", ")}</div>
                </div>
                <div className="hidden sm:flex items-center gap-2">
                  {inquiry.priority === "high" && (
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500" title="High priority" />
                  )}
                  <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", statusColors[inquiry.status] ?? "bg-gray-100 text-gray-700")}>
                    {statusLabels[inquiry.status] ?? inquiry.status}
                  </span>
                </div>
                <span className="text-xs text-navy-400 shrink-0">{timeAgo(inquiry.created_at)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-card">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <h2 className="font-semibold text-navy-900">Upcoming</h2>
            <Link href="/admin/consultations" className="text-sm text-gold-600 hover:text-gold-700 font-medium">
              View all →
            </Link>
          </div>
          <div className="divide-y divide-border">
            {(upcomingConsultations ?? []).length === 0 && (
              <p className="px-6 py-8 text-center text-navy-400 text-sm">No upcoming consultations.</p>
            )}
            {(upcomingConsultations as Array<{ id: string; student_name: string; scheduled_date: string; scheduled_time: string }> ?? []).map((c) => (
              <div key={c.id} className="px-6 py-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-green-400 mt-1.5 shrink-0" />
                  <div>
                    <div className="font-medium text-navy-900 text-sm">{c.student_name}</div>
                    <div className="text-xs text-gold-600 font-medium">{formatDateLabel(c.scheduled_date)}, {formatTime(c.scheduled_time)}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="px-6 py-4 border-t border-border space-y-2">
            <p className="text-xs font-semibold text-navy-400 uppercase tracking-wide mb-3">Quick Actions</p>
            <Link
              href="/admin/inquiries"
              className="flex items-center gap-2 text-sm text-navy-600 hover:text-navy-900 hover:bg-navy-50 px-3 py-2 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
              </svg>
              Filter new inquiries
            </Link>
            <Link
              href="/admin/consultations"
              className="flex items-center gap-2 text-sm text-navy-600 hover:text-navy-900 hover:bg-navy-50 px-3 py-2 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Today&apos;s consultations
            </Link>
          </div>
        </div>
      </div>

      <div className="mt-6 bg-white rounded-xl shadow-card p-6">
        <h2 className="font-semibold text-navy-900 mb-5">Conversion Funnel — This Month</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {funnelStages.map((stage, i) => (
            <div key={stage.label} className="text-center">
              <div className="relative h-24 bg-navy-50 rounded-lg mb-2 overflow-hidden">
                <div
                  className={cn("absolute bottom-0 left-0 right-0 rounded-b-lg transition-all", stage.color)}
                  style={{ height: `${stage.pct}%` }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="font-display text-xl text-navy-900 font-medium">{stage.value}</span>
                </div>
              </div>
              <div className="text-xs text-navy-600 font-medium">{stage.label}</div>
              {i > 0 && <div className="text-xs text-navy-400">{stage.pct}%</div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
