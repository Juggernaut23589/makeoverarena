import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Analytics | Admin",
};

// Mock analytics data — replace with live Supabase view queries
const overviewStats = [
  { label: "Total Inquiries (all time)", value: "2,418", change: "+18% vs last month", positive: true },
  { label: "Inquiries This Month", value: "47", change: "+12% vs last month", positive: true },
  { label: "Consultations This Month", value: "19", change: "+3 vs last month", positive: true },
  { label: "Conversion Rate (inquiry → client)", value: "34%", change: "+2.4%", positive: true },
];

const serviceBreakdown = [
  { service: "Undergraduate", count: 18, pct: 38, color: "bg-blue-400" },
  { service: "Graduate", count: 14, pct: 30, color: "bg-purple-400" },
  { service: "Scholarship", count: 8, pct: 17, color: "bg-gold-400" },
  { service: "Visa", count: 5, pct: 11, color: "bg-green-400" },
  { service: "PhD", count: 2, pct: 4, color: "bg-orange-400" },
];

const countryBreakdown = [
  { country: "United States", count: 16, flag: "🇺🇸" },
  { country: "United Kingdom", count: 14, flag: "🇬🇧" },
  { country: "Canada", count: 9, flag: "🇨🇦" },
  { country: "Australia", count: 5, flag: "🇦🇺" },
  { country: "Germany", count: 3, flag: "🇩🇪" },
];

const sourceBreakdown = [
  { source: "Instagram", count: 17, pct: 36 },
  { source: "WhatsApp / Referral", count: 13, pct: 28 },
  { source: "Google Search", count: 8, pct: 17 },
  { source: "Direct Website", count: 5, pct: 11 },
  { source: "Other", count: 4, pct: 8 },
];

const dailyData = [
  { day: "Mon", inquiries: 8, consultations: 3 },
  { day: "Tue", inquiries: 6, consultations: 2 },
  { day: "Wed", inquiries: 11, consultations: 4 },
  { day: "Thu", inquiries: 7, consultations: 2 },
  { day: "Fri", inquiries: 9, consultations: 5 },
  { day: "Sat", inquiries: 4, consultations: 1 },
  { day: "Sun", inquiries: 2, consultations: 2 },
];

const maxInquiries = Math.max(...dailyData.map((d) => d.inquiries));

const funnelStages = [
  { label: "New Inquiries", value: 47, pct: 100, color: "bg-blue-200 border-blue-300" },
  { label: "Reviewed", value: 38, pct: 81, color: "bg-purple-200 border-purple-300" },
  { label: "Contacted", value: 29, pct: 62, color: "bg-yellow-200 border-yellow-300" },
  { label: "Consultation Booked", value: 19, pct: 40, color: "bg-orange-200 border-orange-300" },
  { label: "Client", value: 16, pct: 34, color: "bg-green-200 border-green-300" },
];

export default function AnalyticsPage() {
  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl text-navy-900">Analytics</h1>
          <p className="text-navy-500 text-sm mt-1">Overview · January 2024</p>
        </div>
        <div className="flex gap-2">
          {["Today", "Week", "Month", "Year"].map((period, i) => (
            <button
              key={period}
              className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-colors ${
                i === 2
                  ? "bg-navy-900 text-white"
                  : "border border-border text-navy-600 hover:bg-navy-50"
              }`}
            >
              {period}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {overviewStats.map((s) => (
          <div key={s.label} className="bg-white rounded-xl shadow-card p-5">
            <div className="font-display text-2xl text-navy-900 font-medium mb-1">
              {s.value}
            </div>
            <div className="text-navy-500 text-xs mb-2">{s.label}</div>
            <div className={`text-xs font-medium ${s.positive ? "text-green-600" : "text-red-500"}`}>
              {s.change}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Bar chart — Weekly inquiries */}
        <div className="bg-white rounded-xl shadow-card p-6">
          <h2 className="font-semibold text-navy-900 mb-1">Inquiries This Week</h2>
          <p className="text-navy-400 text-xs mb-5">Daily inquiry and consultation volume</p>
          <div className="flex items-end gap-3 h-36">
            {dailyData.map((d) => (
              <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex flex-col items-center gap-0.5">
                  {/* Inquiries bar */}
                  <div
                    className="w-full bg-navy-200 rounded-t-sm transition-all"
                    style={{ height: `${(d.inquiries / maxInquiries) * 100}px` }}
                    title={`${d.inquiries} inquiries`}
                  />
                  {/* Consultations bar */}
                  <div
                    className="w-full bg-gold-400 rounded-b-sm transition-all"
                    style={{ height: `${(d.consultations / maxInquiries) * 60}px` }}
                    title={`${d.consultations} consultations`}
                  />
                </div>
                <span className="text-xs text-navy-400">{d.day}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-4 mt-3">
            <div className="flex items-center gap-1.5 text-xs text-navy-500">
              <div className="w-3 h-2 rounded-sm bg-navy-200" /> Inquiries
            </div>
            <div className="flex items-center gap-1.5 text-xs text-navy-500">
              <div className="w-3 h-2 rounded-sm bg-gold-400" /> Consultations
            </div>
          </div>
        </div>

        {/* Funnel */}
        <div className="bg-white rounded-xl shadow-card p-6">
          <h2 className="font-semibold text-navy-900 mb-1">Conversion Funnel</h2>
          <p className="text-navy-400 text-xs mb-5">Inquiry → Client pipeline (this month)</p>
          <div className="space-y-2">
            {funnelStages.map((stage, i) => (
              <div key={stage.label}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-navy-600 font-medium">{stage.label}</span>
                  <span className="text-xs text-navy-400">
                    {stage.value} {i > 0 && `(${stage.pct}%)`}
                  </span>
                </div>
                <div className="h-5 bg-navy-50 rounded-lg overflow-hidden">
                  <div
                    className={`h-full rounded-lg border ${stage.color} transition-all`}
                    style={{ width: `${stage.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Service breakdown */}
        <div className="bg-white rounded-xl shadow-card p-6">
          <h2 className="font-semibold text-navy-900 mb-4">By Service</h2>
          <div className="space-y-3">
            {serviceBreakdown.map((s) => (
              <div key={s.service}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-navy-700">{s.service}</span>
                  <span className="text-xs text-navy-400 font-medium">{s.count} ({s.pct}%)</span>
                </div>
                <div className="h-2 bg-navy-50 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${s.color}`}
                    style={{ width: `${s.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Country breakdown */}
        <div className="bg-white rounded-xl shadow-card p-6">
          <h2 className="font-semibold text-navy-900 mb-4">Top Destinations</h2>
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
                    <div
                      className="h-full bg-navy-300 rounded-full"
                      style={{ width: `${(c.count / countryBreakdown[0].count) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Source breakdown */}
        <div className="bg-white rounded-xl shadow-card p-6">
          <h2 className="font-semibold text-navy-900 mb-4">Traffic Sources</h2>
          <div className="space-y-3">
            {sourceBreakdown.map((s) => (
              <div key={s.source}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-navy-700">{s.source}</span>
                  <span className="text-xs text-navy-400 font-medium">{s.pct}%</span>
                </div>
                <div className="h-2 bg-navy-50 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gold-300 rounded-full"
                    style={{ width: `${s.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-navy-400 mt-4 leading-relaxed">
            Connect Google Analytics 4 to get live traffic data.
          </p>
        </div>
      </div>

      {/* Export */}
      <div className="mt-6 bg-white rounded-xl shadow-card p-5 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-navy-900 text-sm">Export Reports</h3>
          <p className="text-navy-400 text-xs mt-0.5">Download detailed CSV reports for any date range</p>
        </div>
        <div className="flex gap-2">
          <button className="inline-flex items-center gap-2 px-4 py-2 border border-border text-navy-600 rounded-lg text-sm hover:bg-navy-50 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export Inquiries
          </button>
          <button className="inline-flex items-center gap-2 px-4 py-2 border border-border text-navy-600 rounded-lg text-sm hover:bg-navy-50 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export Consultations
          </button>
        </div>
      </div>
    </div>
  );
}
