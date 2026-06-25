import type { Metadata } from "next";
import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { InquiryStatusSelect } from "@/components/admin/inquiry-status-select";

export const metadata: Metadata = {
  title: "Inquiries | Admin",
};

const PAGE_SIZE = 20;

const statusColors: Record<string, string> = {
  new: "bg-blue-100 text-blue-700",
  reviewed: "bg-yellow-100 text-yellow-700",
  contacted: "bg-purple-100 text-purple-700",
  consultation_booked: "bg-green-100 text-green-700",
  proposal_sent: "bg-orange-100 text-orange-700",
  client: "bg-emerald-100 text-emerald-700",
  lost: "bg-red-100 text-red-700",
  on_hold: "bg-gray-100 text-gray-700",
};

const statusLabels: Record<string, string> = {
  new: "New",
  reviewed: "Reviewed",
  contacted: "Contacted",
  consultation_booked: "Consult Booked",
  proposal_sent: "Proposal Sent",
  client: "Client",
  lost: "Lost",
  on_hold: "On Hold",
};

const priorityDot: Record<string, string> = {
  high: "bg-red-400",
  medium: "bg-yellow-400",
  low: "bg-green-400",
};

export default async function InquiriesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; service?: string; priority?: string; page?: string; q?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page ?? 1));
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;
  const searchQuery = (params.q ?? "").trim();

  const { data: inquiries, count } = await (async () => {
    if (!supabaseAdmin) return { data: [], count: 0 };
    let q = supabaseAdmin
      .from("inquiries")
      .select(
        "id, full_name, email, phone, service_type, preferred_countries, budget_range, status, priority, created_at, assigned_to",
        { count: "exact" }
      )
      .order("created_at", { ascending: false })
      .range(from, to);

    if (params.status) q = q.eq("status", params.status);
    if (params.service) q = q.eq("service_type", params.service);
    if (params.priority) q = q.eq("priority", params.priority);
    if (searchQuery) {
      q = q.or(`full_name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%,phone.ilike.%${searchQuery}%`);
    }

    const result = await q;
    return { data: result?.data ?? [], count: result?.count ?? 0 };
  })();

  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const today = new Date().toISOString().slice(0, 10);
  const { count: newToday } = await (supabaseAdmin?.from("inquiries").select("*", { count: "exact", head: true }).eq("status", "new").gte("created_at", today) ?? Promise.resolve({ count: 0 }));

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex items-start sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl text-navy-900">Inquiries</h1>
          <p className="text-navy-500 text-sm mt-1">
            {total} total · {newToday ?? 0} new today
          </p>
        </div>
        <a
          href="/api/admin/inquiries/export"
          className="inline-flex items-center gap-2 px-3 py-2 border border-navy-200 text-navy-700 rounded-lg text-sm hover:bg-navy-50 transition-colors shrink-0"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span className="hidden sm:inline">Export CSV</span>
        </a>
      </div>

      <form method="GET" className="bg-white rounded-xl shadow-card p-4 mb-5">
        <div className="flex flex-col gap-3">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="search"
              name="q"
              defaultValue={searchQuery}
              placeholder="Search by name, email, or phone..."
              className="w-full h-10 pl-9 pr-4 text-sm border border-border rounded-lg bg-navy-50 focus:outline-none focus:ring-2 focus:ring-crimson-400"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <select
              name="status"
              defaultValue={params.status ?? ""}
              className="h-9 px-3 text-sm border border-border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-crimson-400 flex-1 min-w-[120px]"
            >
              <option value="">All Status</option>
              {Object.entries(statusLabels).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
            <select
              name="service"
              defaultValue={params.service ?? ""}
              className="h-9 px-3 text-sm border border-border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-crimson-400 flex-1 min-w-[120px]"
            >
              <option value="">All Services</option>
              <option value="undergraduate">Undergraduate</option>
              <option value="graduate">Graduate</option>
              <option value="phd">PhD</option>
              <option value="scholarship">Scholarship</option>
              <option value="visa">Visa</option>
            </select>
            <select
              name="priority"
              defaultValue={params.priority ?? ""}
              className="h-9 px-3 text-sm border border-border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-crimson-400 flex-1 min-w-[100px]"
            >
              <option value="">All Priority</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            <button type="submit" className="h-9 px-4 text-sm bg-navy-900 text-white rounded-lg hover:bg-navy-800 transition-colors">
              Filter
            </button>
            {(params.status || params.service || params.priority || params.q) && (
              <Link href="/admin/inquiries" className="h-9 px-3 text-sm text-navy-500 hover:text-navy-800 flex items-center">
                Clear
              </Link>
            )}
          </div>
        </div>
      </form>

      <div className="bg-white rounded-xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-navy-50">
              <th className="text-left px-5 py-3 text-xs font-semibold text-navy-500 uppercase tracking-wide">Student</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-navy-500 uppercase tracking-wide">Service</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-navy-500 uppercase tracking-wide hidden md:table-cell">Countries</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-navy-500 uppercase tracking-wide hidden lg:table-cell">Budget</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-navy-500 uppercase tracking-wide">Status</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-navy-500 uppercase tracking-wide hidden sm:table-cell">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {(!inquiries || inquiries.length === 0) && (
              <tr>
                <td colSpan={6} className="px-5 py-12 text-center text-navy-400 text-sm">
                  {searchQuery ? `No inquiries matching "${searchQuery}".` : "No inquiries found."}
                </td>
              </tr>
            )}
            {(inquiries ?? []).map((inquiry) => (
              <tr key={inquiry.id} className="hover:bg-navy-50/40 transition-colors">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-navy-100 flex items-center justify-center text-navy-700 font-semibold text-xs shrink-0">
                      {inquiry.full_name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-medium text-navy-900">{inquiry.full_name}</span>
                        <span className={cn("w-1.5 h-1.5 rounded-full", priorityDot[inquiry.priority] ?? "bg-gray-300")} />
                      </div>
                      <div className="text-navy-400 text-xs">{inquiry.email}</div>
                      <div className="text-navy-300 text-xs">{inquiry.phone}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 text-navy-700 capitalize">{inquiry.service_type}</td>
                <td className="px-4 py-4 text-navy-600 hidden md:table-cell">
                  {(inquiry.preferred_countries as string[]).slice(0, 2).join(", ")}
                </td>
                <td className="px-4 py-4 text-navy-600 hidden lg:table-cell text-xs">{inquiry.budget_range}</td>
                <td className="px-4 py-4">
                  <InquiryStatusSelect
                    inquiryId={inquiry.id}
                    currentStatus={inquiry.status}
                    statusColors={statusColors}
                    statusLabels={statusLabels}
                  />
                </td>
                <td className="px-4 py-4 text-navy-400 text-xs hidden sm:table-cell">
                  {new Date(inquiry.created_at).toLocaleDateString("en-NG", { month: "short", day: "numeric" })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>

        <div className="flex items-center justify-between px-5 py-3 border-t border-border">
          <span className="text-xs text-navy-500">
            Showing {from + 1}–{Math.min(to + 1, total)} of {total} inquiries
          </span>
          <div className="flex gap-1">
            <Link
              href={{ pathname: "/admin/inquiries", query: { ...params, page: page - 1 } }}
              className={cn("px-3 py-1.5 text-xs border border-border rounded-lg text-navy-600 hover:bg-navy-50", page <= 1 && "opacity-40 pointer-events-none")}
            >
              ← Prev
            </Link>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((p) => (
              <Link
                key={p}
                href={{ pathname: "/admin/inquiries", query: { ...params, page: p } }}
                className={cn("px-3 py-1.5 text-xs border rounded-lg", p === page ? "bg-navy-900 text-white border-navy-900 font-medium" : "border-border text-navy-600 hover:bg-navy-50")}
              >
                {p}
              </Link>
            ))}
            <Link
              href={{ pathname: "/admin/inquiries", query: { ...params, page: page + 1 } }}
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
