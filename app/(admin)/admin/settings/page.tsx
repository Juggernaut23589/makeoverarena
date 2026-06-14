import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings | Admin",
};

const teamMembers = [
  { name: "Amara Obi", email: "amara@makeoverarena.com", role: "admin", status: "active" },
  { name: "Chidi Nwosu", email: "chidi@makeoverarena.com", role: "consultant", status: "active" },
  { name: "Sarah Okafor", email: "sarah@makeoverarena.com", role: "consultant", status: "active" },
  { name: "David Adeyemi", email: "david@makeoverarena.com", role: "viewer", status: "inactive" },
];

const emailSequences = [
  { name: "Inquiry Confirmation", trigger: "On inquiry submitted", status: "active", lastSent: "2h ago" },
  { name: "Admin Notification", trigger: "On inquiry submitted", status: "active", lastSent: "2h ago" },
  { name: "48hr Follow-up", trigger: "48h after inquiry if no contact", status: "active", lastSent: "Yesterday" },
  { name: "Week 1 Nurture", trigger: "7 days after inquiry", status: "draft", lastSent: "Never" },
  { name: "Consultation Confirmation", trigger: "On booking created", status: "active", lastSent: "3 days ago" },
  { name: "24hr Reminder", trigger: "24h before consultation", status: "active", lastSent: "Yesterday" },
];

const roleColors: Record<string, string> = {
  admin: "bg-red-100 text-red-700",
  consultant: "bg-blue-100 text-blue-700",
  viewer: "bg-gray-100 text-gray-600",
};

/** True only when an env var is present and not a placeholder (and matches an expected prefix). */
function envReady(value: string | undefined, prefix?: string): boolean {
  if (!value) return false;
  if (/your|placeholder|xxxx|change-me|here/i.test(value)) return false;
  if (value.startsWith("G-XXXX")) return false;
  if (prefix && !value.startsWith(prefix)) return false;
  return true;
}

export default function SettingsPage() {
  return (
    <div className="p-6 lg:p-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="font-display text-3xl text-navy-900">Settings</h1>
        <p className="text-navy-500 text-sm mt-1">
          Manage your team, integrations, and notification preferences
        </p>
      </div>

      <div className="space-y-8">
        {/* Team Management */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-semibold text-navy-900">Team Members</h2>
              <p className="text-navy-400 text-xs mt-0.5">Manage staff access and roles</p>
            </div>
            <button className="inline-flex items-center gap-2 px-4 py-2 bg-navy-900 text-white rounded-lg text-sm font-medium hover:bg-navy-800 transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
              </svg>
              Invite Member
            </button>
          </div>
          <div className="bg-white rounded-xl shadow-card overflow-hidden">
            <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-navy-50">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-navy-500 uppercase tracking-wide">Name</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-navy-500 uppercase tracking-wide hidden sm:table-cell">Email</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-navy-500 uppercase tracking-wide">Role</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-navy-500 uppercase tracking-wide">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {teamMembers.map((member) => (
                  <tr key={member.email} className="hover:bg-navy-50/40 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-navy-100 flex items-center justify-center text-navy-700 font-semibold text-xs shrink-0">
                          {member.name.charAt(0)}
                        </div>
                        <span className="font-medium text-navy-900">{member.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-navy-500 text-xs hidden sm:table-cell">{member.email}</td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${roleColors[member.role]}`}>
                        {member.role}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1.5">
                        <div className={`w-1.5 h-1.5 rounded-full ${member.status === "active" ? "bg-green-400" : "bg-gray-300"}`} />
                        <span className="text-xs text-navy-500 capitalize">{member.status}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <button className="text-xs text-navy-400 hover:text-navy-700 hover:bg-navy-100 px-2 py-1 rounded transition-colors">
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>
        </section>

        {/* Email Sequences */}
        <section>
          <div className="mb-4">
            <h2 className="font-semibold text-navy-900">Email Sequences</h2>
            <p className="text-navy-400 text-xs mt-0.5">Manage automated email triggers and templates</p>
          </div>
          <div className="bg-white rounded-xl shadow-card divide-y divide-border">
            {emailSequences.map((seq) => (
              <div key={seq.name} className="flex items-center gap-4 px-5 py-4">
                <div
                  className={`w-2 h-2 rounded-full shrink-0 ${
                    seq.status === "active" ? "bg-green-400" : "bg-gray-300"
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-navy-900 text-sm">{seq.name}</div>
                  <div className="text-navy-400 text-xs">{seq.trigger}</div>
                </div>
                <div className="hidden sm:block text-xs text-navy-400 shrink-0">
                  Last sent: {seq.lastSent}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      seq.status === "active"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {seq.status === "active" ? "Active" : "Draft"}
                  </span>
                  <button className="text-xs text-navy-400 hover:text-navy-700 hover:bg-navy-100 px-2 py-1 rounded transition-colors">
                    Edit
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Integration Settings */}
        <section>
          <div className="mb-4">
            <h2 className="font-semibold text-navy-900">Integrations</h2>
            <p className="text-navy-400 text-xs mt-0.5">API keys and external service connections</p>
          </div>
          <div className="bg-white rounded-xl shadow-card divide-y divide-border">
            {[
              {
                name: "Supabase",
                description: "Database — stores all inquiries, clients, payments, documents",
                icon: "🗄️",
                configured: envReady(process.env.NEXT_PUBLIC_SUPABASE_URL, "https") && envReady(process.env.SUPABASE_SERVICE_ROLE_KEY),
              },
              {
                name: "Cal.com",
                description: "Booking and consultation scheduling",
                icon: "📅",
                configured: envReady(process.env.NEXT_PUBLIC_CALCOM_URL, "http"),
              },
              {
                name: "Resend",
                description: "Transactional email delivery",
                icon: "✉️",
                configured: envReady(process.env.RESEND_API_KEY, "re_"),
              },
              {
                name: "OpenAI",
                description: "AI chatbot assistant",
                icon: "🤖",
                configured: envReady(process.env.OPENAI_API_KEY, "sk-"),
              },
              {
                name: "Google Analytics",
                description: "Website traffic and event tracking",
                icon: "📊",
                configured: envReady(process.env.NEXT_PUBLIC_GA_ID, "G-"),
              },
              {
                name: "Paystack",
                description: "Online payment processing (NGN, African cards)",
                icon: "💳",
                configured: envReady(process.env.PAYSTACK_SECRET_KEY, "sk_"),
              },
              {
                name: "WhatsApp Cloud API",
                description: "Live customer chat inbox",
                icon: "💬",
                configured: envReady(process.env.WHATSAPP_ACCESS_TOKEN) && envReady(process.env.WHATSAPP_PHONE_NUMBER_ID),
              },
              {
                name: "Upstash Redis",
                description: "Rate limiting and caching",
                icon: "⚡",
                configured: envReady(process.env.UPSTASH_REDIS_REST_URL, "https"),
              },
            ].map((integration) => (
              <div key={integration.name} className="flex items-center gap-4 px-5 py-4">
                <span className="text-2xl shrink-0">{integration.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-navy-900 text-sm">{integration.name}</div>
                  <div className="text-navy-400 text-xs">{integration.description}</div>
                </div>
                <span
                  className={`text-xs px-2.5 py-1 rounded-full font-medium shrink-0 ${
                    integration.configured
                      ? "bg-green-100 text-green-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {integration.configured ? "Connected" : "Not configured"}
                </span>
                <button className="text-xs text-navy-400 hover:text-navy-700 hover:bg-navy-100 px-2 py-1 rounded transition-colors shrink-0">
                  Configure
                </button>
              </div>
            ))}
          </div>
          <p className="text-xs text-navy-400 mt-3 leading-relaxed">
            API keys are managed via environment variables in your deployment platform (e.g., Vercel).
            This panel shows connection status only.
          </p>
        </section>

        {/* Notifications */}
        <section>
          <div className="mb-4">
            <h2 className="font-semibold text-navy-900">Notification Preferences</h2>
            <p className="text-navy-400 text-xs mt-0.5">Control which events trigger admin email alerts</p>
          </div>
          <div className="bg-white rounded-xl shadow-card divide-y divide-border">
            {[
              { label: "New inquiry submitted", description: "Send email to admin when a student submits an inquiry", enabled: true },
              { label: "New consultation booked", description: "Send email when a student books via Cal.com", enabled: true },
              { label: "Consultation no-show", description: "Alert when a scheduled consultation is missed", enabled: true },
              { label: "Daily inquiry digest", description: "Morning summary of all inquiries from the previous day", enabled: false },
              { label: "Weekly performance report", description: "Monday morning conversion and pipeline report", enabled: false },
            ].map((pref) => (
              <div key={pref.label} className="flex items-center gap-4 px-5 py-4">
                <div className="flex-1">
                  <div className="font-medium text-navy-900 text-sm">{pref.label}</div>
                  <div className="text-navy-400 text-xs mt-0.5">{pref.description}</div>
                </div>
                {/* Toggle switch (visual only — wire to server action) */}
                <button
                  role="switch"
                  aria-checked={pref.enabled}
                  className={`relative w-10 h-5 rounded-full shrink-0 transition-colors ${
                    pref.enabled ? "bg-navy-900" : "bg-gray-200"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                      pref.enabled ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Branding */}
        <section>
          <div className="mb-4">
            <h2 className="font-semibold text-navy-900">Company Information</h2>
            <p className="text-navy-400 text-xs mt-0.5">Used in email templates and public pages</p>
          </div>
          <div className="bg-white rounded-xl shadow-card p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {[
                { label: "Company Name", placeholder: "MakeoverArena", value: "MakeoverArena" },
                { label: "Admin Email", placeholder: "admin@makeoverarena.com", value: "admin@makeoverarena.com" },
                { label: "WhatsApp Number", placeholder: "+234 800 000 0000", value: "" },
                { label: "Instagram Handle", placeholder: "@makeoverarena", value: "@makeoverarena" },
                { label: "Website URL", placeholder: "https://makeoverarena.com", value: "https://makeoverarena.com" },
                { label: "LinkedIn URL", placeholder: "linkedin.com/company/...", value: "" },
              ].map((field) => (
                <div key={field.label}>
                  <label className="block text-xs font-semibold text-navy-600 mb-1.5">{field.label}</label>
                  <input
                    type="text"
                    defaultValue={field.value}
                    placeholder={field.placeholder}
                    className="w-full h-9 px-3 text-sm border border-border rounded-lg bg-navy-50 focus:outline-none focus:ring-2 focus:ring-gold-400"
                  />
                </div>
              ))}
            </div>
            <div className="mt-5 flex justify-end">
              <button className="px-5 py-2 bg-navy-900 text-white rounded-lg text-sm font-medium hover:bg-navy-800 transition-colors">
                Save Changes
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
