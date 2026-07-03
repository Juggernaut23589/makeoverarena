import type { Metadata } from "next";
import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Pipeline | Admin" };

// Maps the 9 real process stages to DB values
const PIPELINE_STAGES = [
  {
    id: "intake",
    label: "Intake",
    sublabel: "Stage 1 — Front Desk",
    team: "Front Desk",
    color: "border-blue-300 bg-blue-50",
    headerColor: "bg-blue-600",
    dot: "bg-blue-500",
    statuses: ["new"],
    table: "inquiries" as const,
    action: "Respond & qualify",
  },
  {
    id: "qualifying",
    label: "Qualifying",
    sublabel: "Stage 1 — Front Desk",
    team: "Front Desk",
    color: "border-violet-300 bg-violet-50",
    headerColor: "bg-violet-600",
    dot: "bg-violet-500",
    statuses: ["reviewed", "contacted"],
    table: "inquiries" as const,
    action: "Verify docs & eligibility",
  },
  {
    id: "awaiting_payment",
    label: "Awaiting Payment",
    sublabel: "Stage 1 — Front Desk",
    team: "Front Desk",
    color: "border-amber-300 bg-amber-50",
    headerColor: "bg-amber-500",
    dot: "bg-amber-400",
    statuses: ["consultation_booked", "proposal_sent"],
    table: "inquiries" as const,
    action: "Send payment details",
  },
  {
    id: "sourcing",
    label: "Sourcing",
    sublabel: "Stages 2–3 — Sourcing Team",
    team: "Sourcing",
    color: "border-orange-300 bg-orange-50",
    headerColor: "bg-orange-500",
    dot: "bg-orange-400",
    statuses: ["paid", "partial"],
    table: "clients" as const,
    action: "Find scholarships & universities",
  },
  {
    id: "review",
    label: "Under Review",
    sublabel: "Stage 4 — Review Team",
    team: "Review",
    color: "border-rose-300 bg-rose-50",
    headerColor: "bg-rose-600",
    dot: "bg-rose-500",
    statuses: [],
    table: "clients" as const,
    action: "Quality check sourcing results",
    pending_db: true,
  },
  {
    id: "application",
    label: "Application",
    sublabel: "Stages 6–9 — Application Team",
    team: "Application",
    color: "border-teal-300 bg-teal-50",
    headerColor: "bg-teal-600",
    dot: "bg-teal-500",
    statuses: [],
    table: "clients" as const,
    action: "SOP, portal setup, submission",
    pending_db: true,
  },
];

type InquiryRow = {
  id: string;
  full_name: string;
  email: string;
  service_type: string;
  status: string;
  priority: string | null;
  created_at: string;
};

type ClientRow = {
  id: string;
  full_name: string;
  email: string;
  service_type: string | null;
  payment_status: string | null;
  assigned_staff_name: string | null;
  created_at: string;
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(diff / 86400000);
  if (h < 1) return "just now";
  if (h < 24) return `${h}h ago`;
  if (d === 1) return "yesterday";
  return `${d}d ago`;
}

export default async function PipelinePage() {
  const db = supabaseAdmin;
  if (!db) {
    return (
      <div className="p-8 text-navy-500">Database not configured.</div>
    );
  }

  const [{ data: inquiries }, { data: clients }] = await Promise.all([
    db
      .from("inquiries")
      .select("id, full_name, email, service_type, status, priority, created_at")
      .not("status", "in", '("lost","on_hold","client")')
      .order("created_at", { ascending: false }),
    db
      .from("client_profiles")
      .select("id, full_name, email, service_type, payment_status, assigned_staff_name, created_at")
      .order("created_at", { ascending: false }),
  ]);

  const inquiryRows = (inquiries ?? []) as InquiryRow[];
  const clientRows = (clients ?? []) as ClientRow[];

  const getInquiriesForStage = (statuses: string[]) =>
    inquiryRows.filter((r) => statuses.includes(r.status));

  const getClientsForStage = (statuses: string[]) =>
    clientRows.filter((r) => statuses.includes(r.payment_status ?? ""));

  const totalActive =
    inquiryRows.length + clientRows.filter((c) => c.payment_status === "paid" || c.payment_status === "partial").length;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl text-navy-900">Pipeline</h1>
          <p className="text-navy-500 text-sm mt-1">
            {totalActive} active leads & clients across all stages
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Link
            href="/admin/inquiries"
            className="inline-flex items-center gap-1.5 px-3 py-2 border border-navy-200 text-navy-700 rounded-lg text-sm hover:bg-navy-50 transition-colors"
          >
            All Inquiries
          </Link>
          <Link
            href="/admin/clients"
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-navy-900 text-white rounded-lg text-sm hover:bg-navy-800 transition-colors"
          >
            All Clients
          </Link>
        </div>
      </div>

      {/* Team legend */}
      <div className="flex flex-wrap gap-3 mb-6">
        {[
          { label: "Front Desk", dot: "bg-blue-500" },
          { label: "Sourcing Team", dot: "bg-orange-400" },
          { label: "Review Team", dot: "bg-rose-500" },
          { label: "Application Team", dot: "bg-teal-500" },
        ].map((t) => (
          <span key={t.label} className="flex items-center gap-1.5 text-xs text-navy-600 bg-white border border-border rounded-full px-3 py-1">
            <span className={cn("w-2 h-2 rounded-full", t.dot)} />
            {t.label}
          </span>
        ))}
      </div>

      {/* Pipeline board — horizontal scroll on small screens */}
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-4 min-w-[960px]">
          {PIPELINE_STAGES.map((stage) => {
            const items =
              stage.table === "inquiries"
                ? getInquiriesForStage(stage.statuses)
                : getClientsForStage(stage.statuses);

            return (
              <div key={stage.id} className="flex-1 min-w-[220px] max-w-[280px]">
                {/* Column header */}
                <div className={cn("rounded-t-xl px-4 py-3", stage.headerColor)}>
                  <div className="flex items-center justify-between">
                    <h2 className="font-semibold text-white text-sm">{stage.label}</h2>
                    <span className="bg-white/20 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      {stage.pending_db ? "—" : items.length}
                    </span>
                  </div>
                  <p className="text-white/70 text-xs mt-0.5">{stage.sublabel}</p>
                </div>

                {/* Action hint */}
                <div className="bg-white border-x border-border px-3 py-2 flex items-center gap-1.5">
                  <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", stage.dot)} />
                  <span className="text-xs text-navy-400">{stage.action}</span>
                </div>

                {/* Cards */}
                <div className={cn("border border-t-0 rounded-b-xl min-h-[200px] divide-y divide-border/60", stage.color)}>
                  {stage.pending_db ? (
                    <div className="px-4 py-6 text-center">
                      <p className="text-xs text-navy-400 italic">
                        Stage tracking column needed in DB
                      </p>
                      <Link
                        href="/admin/clients"
                        className="text-xs text-crimson-600 hover:underline mt-1 block"
                      >
                        View all clients →
                      </Link>
                    </div>
                  ) : items.length === 0 ? (
                    <div className="px-4 py-6 text-center">
                      <p className="text-xs text-navy-400">Nothing here</p>
                    </div>
                  ) : (
                    items.slice(0, 8).map((item) => {
                      const isClient = stage.table === "clients";
                      const name = item.full_name;
                      const service = item.service_type ?? "—";
                      const date = timeAgo(item.created_at);
                      const href = isClient
                        ? `/admin/clients`
                        : `/admin/inquiries`;
                      const priority = !isClient ? (item as InquiryRow).priority : null;
                      const assignee = isClient ? (item as ClientRow).assigned_staff_name : null;

                      return (
                        <Link
                          key={item.id}
                          href={href}
                          className="block px-3 py-3 hover:bg-white/60 transition-colors group"
                        >
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <div className="flex items-center gap-1.5 min-w-0">
                              {priority === "high" && (
                                <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" title="High priority" />
                              )}
                              <span className="font-medium text-navy-900 text-xs truncate group-hover:text-crimson-600 transition-colors">
                                {name}
                              </span>
                            </div>
                            <span className="text-navy-400 text-[10px] shrink-0">{date}</span>
                          </div>
                          <div className="text-navy-500 text-[11px] capitalize">{service}</div>
                          {assignee && (
                            <div className="text-navy-400 text-[10px] mt-1 truncate">→ {assignee}</div>
                          )}
                        </Link>
                      );
                    })
                  )}
                  {!stage.pending_db && items.length > 8 && (
                    <div className="px-3 py-2">
                      <Link
                        href={stage.table === "clients" ? "/admin/clients" : `/admin/inquiries?status=${stage.statuses[0]}`}
                        className="text-xs text-crimson-600 hover:underline"
                      >
                        +{items.length - 8} more
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Completed column */}
          <div className="flex-1 min-w-[220px] max-w-[280px]">
            <div className="rounded-t-xl px-4 py-3 bg-emerald-600">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-white text-sm">Completed</h2>
                <span className="bg-white/20 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {clientRows.filter((c) => c.payment_status === "paid").length}
                </span>
              </div>
              <p className="text-white/70 text-xs mt-0.5">All stages — Clients served</p>
            </div>
            <div className="bg-white border-x border-border px-3 py-2 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
              <span className="text-xs text-navy-400">Admission received / visa approved</span>
            </div>
            <div className="border border-t-0 rounded-b-xl min-h-[200px] bg-emerald-50 border-emerald-300">
              <div className="px-4 py-6 text-center">
                <p className="text-xs text-navy-400 italic">Completion stage tracking column needed in DB</p>
                <Link href="/admin/clients" className="text-xs text-crimson-600 hover:underline mt-1 block">
                  View all clients →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lost / On Hold */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {(["lost", "on_hold"] as const).map((status) => {
          const label = status === "lost" ? "Lost" : "On Hold";
          const items = inquiryRows.filter((r) => r.status === status);
          return (
            <div key={status} className="bg-white rounded-xl border border-border shadow-card">
              <div className="flex items-center justify-between px-5 py-3 border-b border-border">
                <h3 className="font-semibold text-navy-900 text-sm">{label}</h3>
                <span className="text-xs text-navy-400">{items.length}</span>
              </div>
              {items.length === 0 ? (
                <p className="px-5 py-4 text-xs text-navy-400">None</p>
              ) : (
                <div className="divide-y divide-border">
                  {items.slice(0, 4).map((item) => (
                    <div key={item.id} className="flex items-center justify-between px-5 py-3">
                      <div>
                        <div className="text-sm font-medium text-navy-800">{item.full_name}</div>
                        <div className="text-xs text-navy-400 capitalize">{item.service_type}</div>
                      </div>
                      <span className="text-xs text-navy-400">{timeAgo(item.created_at)}</span>
                    </div>
                  ))}
                  {items.length > 4 && (
                    <Link href={`/admin/inquiries?status=${status}`} className="block px-5 py-2 text-xs text-crimson-600 hover:underline">
                      +{items.length - 4} more
                    </Link>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
