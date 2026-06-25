import type { Metadata } from "next";
import { supabaseAdmin } from "@/lib/supabase";

export const metadata: Metadata = { title: "Analytics | Admin" };

export default async function AnalyticsPage() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59).toISOString();
  const startOfWeek = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000);
  startOfWeek.setHours(0, 0, 0, 0);
  const todayStr = now.toISOString().slice(0, 10);

  const [
    { count: totalAll },
    { count: thisMonth },
    { count: lastMonthCount },
    { count: consultMonth },
    { data: allInquiries },
    { data: funnelData },
    { data: serviceData },
    { data: countryData },
    { data: sourceData },
    { data: weeklyData },
  ] = await Promise.all([
    supabaseAdmin?.from("inquiries").select("*", { count: "exact", head: true }) ?? Promise.resolve({ count: 0 }),
    supabaseAdmin?.from("inquiries").select("*", { count: "exact", head: true }).gte("created_at", startOfMonth) ?? Promise.resolve({ count: 0 }),
    supabaseAdmin?.from("inquiries").select("*", { count: "exact", head: true }).gte("created_at", startOfLastMonth).lte("created_at", endOfLastMonth) ?? Promise.resolve({ count: 0 }),
    supabaseAdmin?.from("consultations").select("*", { count: "exact", head: true }).gte("created_at", startOfMonth) ?? Promise.resolve({ count: 0 }),
    supabaseAdmin?.from("inquiries").select("status").gte("created_at", startOfMonth) ?? Promise.resolve({ data: [] }),
    supabaseAdmin?.from("inquiries").select("status").gte("created_at", startOfMonth) ?? Promise.resolve({ data: [] }),
    supabaseAdmin?.from("inquiries").select("service_type, status") ?? Promise.resolve({ data: [] }),
    supabaseAdmin?.from("inquiries").select("preferred_countries") ?? Promise.resolve({ data: [] }),
    supabaseAdmin?.from("inquiries").select("referral_source") ?? Promise.resolve({ data: [] }),
    supabaseAdmin?.from("inquiries").select("created_at").gte("created_at", startOfWeek.toISOString()) ?? Promise.resolve({ data: [] }),
  ]);

  const monthChange = (lastMonthCount ?? 0) > 0
    ? Math.round((((thisMonth ?? 0) - (lastMonthCount ?? 0)) / (lastMonthCount ?? 1)) * 100)
    : 0;

  const inquiryList = (allInquiries ?? []) as { status: string }[];
  const clientCount = inquiryList.filter((i) => i.status === "client").length;
  const convRate = (thisMonth ?? 0) > 0 ? Math.round((clientCount / (thisMonth ?? 1)) * 100) : 0;

  const funnel = {
    new: 0, reviewed: 0, contacted: 0, consultation_booked: 0, client: 0,
  };
  for (const r of (funnelData ?? []) as { status: string }[]) {
    const s = r.status as keyof typeof funnel;
    if (s in funnel) funnel[s]++;
  }
  const funnelTotal = (thisMonth ?? 1) || 1;
  const funnelStages = [
    { label: "New Inquiries", value: funnelTotal, pct: 100, color: "bg-blue-200 border-blue-300" },
    { label: "Reviewed", value: funnel.reviewed + funnel.contacted + funnel.consultation_booked + funnel.client, pct: Math.round(((funnel.reviewed + funnel.contacted + funnel.consultation_booked + funnel.client) / funnelTotal) * 100), color: "bg-purple-200 border-purple-300" },
    { label: "Contacted", value: funnel.contacted + funnel.consultation_booked + funnel.client, pct: Math.round(((funnel.contacted + funnel.consultation_booked + funnel.client) / funnelTotal) * 100), color: "bg-yellow-200 border-yellow-300" },
    { label: "Consultation", value: funnel.consultation_booked + funnel.client, pct: Math.round(((funnel.consultation_booked + funnel.client) / funnelTotal) * 100), color: "bg-orange-200 border-orange-300" },
    { label: "Client", value: funnel.client, pct: Math.round((funnel.client / funnelTotal) * 100), color: "bg-green-200 border-green-300" },
  ];

  // Service breakdown
  const serviceCounts: Record<string, { total: number; clients: number }> = {};
  for (const r of (serviceData ?? []) as { service_type: string; status: string }[]) {
    if (!serviceCounts[r.service_type]) serviceCounts[r.service_type] = { total: 0, clients: 0 };
    serviceCounts[r.service_type].total++;
    if (r.status === "client") serviceCounts[r.service_type].clients++;
  }
  const totalInquiries = (totalAll ?? 1) || 1;
  const serviceBreakdown = Object.entries(serviceCounts)
    .sort((a, b) => b[1].total - a[1].total)
    .slice(0, 5)
    .map(([service, d]) => ({
      service: service.charAt(0).toUpperCase() + service.slice(1),
      count: d.total,
      pct: Math.round((d.total / totalInquiries) * 100),
      color: service === "undergraduate" ? "bg-blue-400" : service === "graduate" ? "bg-purple-400" : service === "scholarship" ? "bg-crimson-400" : service === "visa" ? "bg-green-400" : "bg-orange-400",
    }));

  // Country breakdown
  const countryCounts: Record<string, number> = {};
  for (const r of (countryData ?? []) as { preferred_countries: string[] }[]) {
    for (const c of r.preferred_countries ?? []) {
      countryCounts[c] = (countryCounts[c] ?? 0) + 1;
    }
  }
  const flagMap: Record<string, string> = {
    "United States": "🇺🇸", "United Kingdom": "🇬🇧", "Canada": "🇨🇦",
    "Australia": "🇦🇺", "Germany": "🇩🇪", "Netherlands": "🇳🇱",
    "USA": "🇺🇸", "UK": "🇬🇧",
  };
  const countryBreakdown = Object.entries(countryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([country, count]) => ({ country, count, flag: flagMap[country] ?? "🌍" }));
  const maxCountry = countryBreakdown[0]?.count || 1;

  // Source breakdown
  const sourceCounts: Record<string, number> = {};
  for (const r of (sourceData ?? []) as { referral_source: string }[]) {
    if (r.referral_source) sourceCounts[r.referral_source] = (sourceCounts[r.referral_source] ?? 0) + 1;
  }
  const totalSources = Object.values(sourceCounts).reduce((s, v) => s + v, 0) || 1;
  const sourceBreakdown = Object.entries(sourceCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([source, count]) => ({ source, count, pct: Math.round((count / totalSources) * 100) }));

  // Weekly data — last 7 days
  const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const dailyBuckets: Record<string, number> = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    dailyBuckets[d.toISOString().slice(0, 10)] = 0;
  }
  for (const r of (weeklyData ?? []) as { created_at: string }[]) {
    const day = r.created_at.slice(0, 10);
    if (day in dailyBuckets) dailyBuckets[day]++;
  }
  const dailyData = Object.entries(dailyBuckets).map(([date, count]) => ({
    day: dayLabels[new Date(date).getDay()],
    inquiries: count,
  }));
  const maxInquiries = Math.max(...dailyData.map((d) => d.inquiries), 1);

  const overviewStats = [
    { label: "Total Inquiries (all time)", value: String(totalAll ?? 0), change: `${monthChange >= 0 ? "+" : ""}${monthChange}% vs last month`, positive: monthChange >= 0 },
    { label: "Inquiries This Month", value: String(thisMonth ?? 0), change: `${monthChange >= 0 ? "+" : ""}${monthChange}% vs last month`, positive: monthChange >= 0 },
    { label: "Consultations This Month", value: String(consultMonth ?? 0), change: "This month", positive: true },
    { label: "Conversion Rate (inquiry → client)", value: `${convRate}%`, change: "Inquiry → Client", positive: convRate > 0 },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl text-navy-900">Analytics</h1>
          <p className="text-navy-500 text-sm mt-1">
            {now.toLocaleDateString("en-NG", { month: "long", year: "numeric" })} · Live data
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        {overviewStats.map((s) => (
          <div key={s.label} className="bg-white rounded-xl shadow-card p-3 sm:p-5">
            <div className="font-display text-xl sm:text-2xl text-navy-900 font-medium mb-1">{s.value}</div>
            <div className="text-navy-500 text-xs mb-1 leading-tight">{s.label}</div>
            <div className={`text-xs font-medium hidden sm:block ${s.positive ? "text-green-600" : "text-red-500"}`}>{s.change}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-card p-6">
          <h2 className="font-semibold text-navy-900 mb-1">Inquiries — Last 7 Days</h2>
          <p className="text-navy-400 text-xs mb-5">Daily inquiry volume</p>
          <div className="flex items-end gap-3 h-36">
            {dailyData.map((d) => (
              <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full bg-navy-200 rounded-t-sm transition-all"
                  style={{ height: `${(d.inquiries / maxInquiries) * 100}px`, minHeight: d.inquiries > 0 ? "4px" : "0" }}
                  title={`${d.inquiries} inquiries`}
                />
                <span className="text-xs text-navy-400">{d.day}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-card p-6">
          <h2 className="font-semibold text-navy-900 mb-1">Conversion Funnel</h2>
          <p className="text-navy-400 text-xs mb-5">Inquiry → Client pipeline (this month)</p>
          <div className="space-y-2">
            {funnelStages.map((stage, i) => (
              <div key={stage.label}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-navy-600 font-medium">{stage.label}</span>
                  <span className="text-xs text-navy-400">{stage.value} {i > 0 && `(${stage.pct}%)`}</span>
                </div>
                <div className="h-5 bg-navy-50 rounded-lg overflow-hidden">
                  <div className={`h-full rounded-lg border ${stage.color} transition-all`} style={{ width: `${stage.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-card p-6">
          <h2 className="font-semibold text-navy-900 mb-4">By Service</h2>
          {serviceBreakdown.length === 0 ? (
            <p className="text-navy-400 text-sm">No data yet.</p>
          ) : (
            <div className="space-y-3">
              {serviceBreakdown.map((s) => (
                <div key={s.service}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-navy-700">{s.service}</span>
                    <span className="text-xs text-navy-400 font-medium">{s.count} ({s.pct}%)</span>
                  </div>
                  <div className="h-2 bg-navy-50 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${s.color}`} style={{ width: `${s.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-card p-6">
          <h2 className="font-semibold text-navy-900 mb-4">Top Destinations</h2>
          {countryBreakdown.length === 0 ? (
            <p className="text-navy-400 text-sm">No data yet.</p>
          ) : (
            <div className="space-y-3">
              {countryBreakdown.map((c) => (
                <div key={c.country} className="flex items-center gap-3">
                  <span className="text-xl shrink-0">{c.flag}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-sm text-navy-700">{c.country}</span>
                      <span className="text-xs text-navy-400 font-medium">{c.count}</span>
                    </div>
                    <div className="h-1.5 bg-navy-50 rounded-full overflow-hidden">
                      <div className="h-full bg-navy-300 rounded-full" style={{ width: `${(c.count / maxCountry) * 100}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-card p-6">
          <h2 className="font-semibold text-navy-900 mb-4">Traffic Sources</h2>
          {sourceBreakdown.length === 0 ? (
            <p className="text-navy-400 text-sm">No data yet.</p>
          ) : (
            <div className="space-y-3">
              {sourceBreakdown.map((s) => (
                <div key={s.source}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-navy-700 capitalize">{s.source}</span>
                    <span className="text-xs text-navy-400 font-medium">{s.pct}%</span>
                  </div>
                  <div className="h-2 bg-navy-50 rounded-full overflow-hidden">
                    <div className="h-full bg-crimson-300 rounded-full" style={{ width: `${s.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 bg-white rounded-xl shadow-card p-5 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-navy-900 text-sm">Export Reports</h3>
          <p className="text-navy-400 text-xs mt-0.5">Download CSV reports</p>
        </div>
        <div className="flex gap-2">
          <a
            href="/api/admin/inquiries/export"
            className="inline-flex items-center gap-2 px-4 py-2 border border-border text-navy-600 rounded-lg text-sm hover:bg-navy-50 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export Inquiries
          </a>
        </div>
      </div>
    </div>
  );
}
