import type { Metadata } from "next";
import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Consultations | Admin",
};

const PAGE_SIZE = 20;

const statusColors: Record<string, string> = {
  scheduled: "bg-blue-100 text-blue-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-gray-100 text-gray-600",
  no_show: "bg-red-100 text-red-700",
  rescheduled: "bg-yellow-100 text-yellow-700",
};

const statusLabels: Record<string, string> = {
  scheduled: "Scheduled",
  completed: "Completed",
  cancelled: "Cancelled",
  no_show: "No Show",
  rescheduled: "Rescheduled",
};

const outcomeLabels: Record<string, string> = {
  proposal_sent: "Proposal Sent",
  enrolled: "Enrolled",
  needs_followup: "Needs Follow-up",
  not_interested: "Not Interested",
};

const outcomeColors: Record<string, string> = {
  proposal_sent: "bg-orange-100 text-orange-700",
  enrolled: "bg-emerald-100 text-emerald-700",
  needs_followup: "bg-purple-100 text-purple-700",
  not_interested: "bg-gray-100 text-gray-600",
};

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
  return new Date(dateStr).toLocaleDateString("en-NG", { weekday: "short", month: "short", day: "numeric" });
}

export default async function ConsultationsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page ?? 1));
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const supabase = await createAdminClient();
  const today = new Date().toISOString().slice(0, 10);
  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = (supabase as any)
    .from("consultations")
    .select(
      "id, student_name, student_email, student_phone, scheduled_date, scheduled_time, duration_minutes, meeting_link, status, outcome, consultation_notes",
      { count: "exact" }
    )
    .order("scheduled_date", { ascending: false })
    .order("scheduled_time", { ascending: false })
    .range(from, to);

  if (params.status) query = query.eq("status", params.status);

  const [
    { data: consultations, count },
    { count: todayCount },
    { count: upcomingCount },
    { count: completedMonth },
    { count: noShowCount },
    { count: resolvedCount },
  ] = await Promise.all([
    query,
    supabase.from("consultations").select("*", { count: "exact", head: true }).eq("scheduled_date", today),
    supabase.from("consultations").select("*", { count: "exact", head: true }).eq("status", "scheduled").gt("scheduled_date", today),
    supabase.from("consultations").select("*", { count: "exact", head: true }).eq("status", "completed").gte("scheduled_date", startOfMonth),
    supabase.from("consultations").select("*", { count: "exact", head: true }).eq("status", "no_show").gte("scheduled_date", startOfMonth),
    supabase.from("consultations").select("*", { count: "exact", head: true }).in("status", ["completed", "no_show"]).gte("scheduled_date", startOfMonth),
  ]);

  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const noShowRate = (resolvedCount ?? 0) > 0
    ? Math.round(((noShowCount ?? 0) / (resolvedCount ?? 1)) * 100)
    : 0;

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl text-navy-900">Consultations</h1>
          <p className="text-navy-500 text-sm mt-1">
            {upcomingCount ?? 0} upcoming · {completedMonth ?? 0} completed this month
          </p>
        </div>
        <a
          href="/book"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 bg-gold-500 text-navy-900 rounded-lg text-sm font-semibold hover:bg-gold-400 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
          </svg>
          New Booking
        </a>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Today", value: todayCount ?? 0, color: "text-blue-600 bg-blue-50", icon: "📅" },
          { label: "Upcoming", value: upcomingCount ?? 0, color: "text-purple-600 bg-purple-50", icon: "🗓️" },
          { label: "Completed (month)", value: completedMonth ?? 0, color: "text-green-600 bg-green-50", icon: "✅" },
          { label: "No-show Rate", value: `${noShowRate}%`, color: "text-red-600 bg-red-50", icon: "❌" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl shadow-card p-5">
            <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center text-lg mb-3", s.color)}>
              {s.icon}
            </div>
            <div className="font-display text-2xl text-navy-900 font-medium">{s.value}</div>
            <div className="text-navy-500 text-xs mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <form method="GET" className="bg-white rounded-xl shadow-card p-4 mb-5">
        <div className="flex flex-wrap gap-3 items-center">
          <select
            name="status"
            defaultValue={params.status ?? ""}
            className="h-9 px-3 text-sm border border-border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-gold-400"
          >
            <option value="">All Status</option>
            {Object.entries(statusLabels).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
          <button
            type="submit"
            className="h-9 px-4 text-sm bg-navy-900 text-white rounded-lg hover:bg-navy-800 transition-colors"
          >
            Filter
          </button>
          {params.status && (
            <Link href="/admin/consultations" className="h-9 px-3 text-sm text-navy-500 hover:text-navy-800 flex items-center">
              Clear
            </Link>
          )}
        </div>
      </form>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-navy-50">
              <th className="text-left px-5 py-3 text-xs font-semibold text-navy-500 uppercase tracking-wide">Student</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-navy-500 uppercase tracking-wide">Date & Time</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-navy-500 uppercase tracking-wide">Status</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-navy-500 uppercase tracking-wide hidden xl:table-cell">Outcome</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {(!consultations || consultations.length === 0) && (
              <tr>
                <td colSpan={5} className="px-5 py-12 text-center text-navy-400 text-sm">
                  No consultations found.
                </td>
              </tr>
            )}
            {(consultations ?? []).map((c: {
              id: string; student_name: string; student_email: string;
              scheduled_date: string; scheduled_time: string; duration_minutes: number;
              meeting_link: string | null; status: string; outcome: string | null;
            }) => (
              <tr key={c.id} className="hover:bg-navy-50/40 transition-colors cursor-pointer">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-navy-100 flex items-center justify-center text-navy-700 font-semibold text-xs shrink-0">
                      {c.student_name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-medium text-navy-900">{c.student_name}</div>
                      <div className="text-navy-400 text-xs">{c.student_email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className={cn("font-medium text-sm", c.scheduled_date === today ? "text-gold-600" : "text-navy-900")}>
                    {formatDateLabel(c.scheduled_date)}
                  </div>
                  <div className="text-navy-400 text-xs">{formatTime(c.scheduled_time)} · {c.duration_minutes}min</div>
                </td>
                <td className="px-4 py-4">
                  <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium", statusColors[c.status] ?? "bg-gray-100 text-gray-700")}>
                    {statusLabels[c.status] ?? c.status}
                  </span>
                </td>
                <td className="px-4 py-4 hidden xl:table-cell">
                  {c.outcome ? (
                    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium", outcomeColors[c.outcome] ?? "bg-gray-100 text-gray-700")}>
                      {outcomeLabels[c.outcome] ?? c.outcome}
                    </span>
                  ) : (
                    <span className="text-navy-300 text-xs">—</span>
                  )}
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-1">
                    {c.meeting_link && c.status === "scheduled" && (
                      <a
                        href={c.meeting_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors font-medium"
                      >
                        Join
                      </a>
                    )}
                    <button className="text-navy-400 hover:text-navy-700 p-1 rounded-lg hover:bg-navy-100 transition-colors">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-border">
          <span className="text-xs text-navy-500">Showing {from + 1}–{Math.min(to + 1, total)} of {total}</span>
          <div className="flex gap-1">
            <Link
              href={{ pathname: "/admin/consultations", query: { ...params, page: page - 1 } }}
              className={cn("px-3 py-1.5 text-xs border border-border rounded-lg text-navy-600 hover:bg-navy-50", page <= 1 && "opacity-40 pointer-events-none")}
            >
              ← Prev
            </Link>
            <Link
              href={{ pathname: "/admin/consultations", query: { ...params, page: page + 1 } }}
              className={cn("px-3 py-1.5 text-xs border border-border rounded-lg text-navy-600 hover:bg-navy-50", page >= totalPages && "opacity-40 pointer-events-none")}
            >
              Next →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
