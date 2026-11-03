import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { getAdminSession } from "@/app/(admin)/admin/login/actions";
import { cn } from "@/lib/utils";
import { InvoiceForm } from "./invoice-form";

export const metadata: Metadata = { title: "Client | Admin" };
export const dynamic = "force-dynamic";

const PAYMENT_STATUS_COLORS: Record<string, string> = {
  paid: "bg-green-100 text-green-700",
  partial: "bg-orange-100 text-orange-700",
  pending: "bg-yellow-100 text-yellow-700",
  failed: "bg-red-100 text-red-700",
  refunded: "bg-gray-100 text-gray-600",
};

const APPLICATION_STATUS_COLORS: Record<string, string> = {
  not_started: "bg-gray-100 text-gray-600",
  in_progress: "bg-blue-100 text-blue-700",
  submitted: "bg-indigo-100 text-indigo-700",
  under_review: "bg-purple-100 text-purple-700",
  offer_received: "bg-green-100 text-green-700",
  accepted: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
  deferred: "bg-orange-100 text-orange-700",
  completed: "bg-green-100 text-green-700",
  on_hold: "bg-yellow-100 text-yellow-700",
};

function money(amount: number, currency = "NGN") {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency }).format(amount);
}

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session || !["super_admin", "admin"].includes(session.role)) {
    redirect("/admin?error=forbidden");
  }

  const { id } = await params;
  const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: client } = await adminClient
    .from("client_profiles")
    .select("*")
    .eq("id", id)
    .maybeSingle<Record<string, unknown>>();

  if (!client) notFound();

  const [{ data: payments }, { data: applications }, { data: documents }] = await Promise.all([
    adminClient.from("payments").select("id, amount, currency, status, description, created_at, paid_at").eq("client_id", id).order("created_at", { ascending: false }),
    adminClient.from("application_tracking").select("id, type, title, institution, destination_country, status, deadline").eq("client_id", id).order("created_at", { ascending: false }),
    adminClient.from("documents").select("id, document_type, status, created_at").eq("client_id", id).order("created_at", { ascending: false }),
  ]);

  const fullName = client.full_name as string;
  const email = client.email as string;
  const paymentStatus = (client.payment_status as string) ?? "pending";

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <Link href="/admin/clients" className="text-xs text-navy-400 hover:text-navy-700 mb-3 inline-block">
        ← All clients
      </Link>
      <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl text-navy-900">{fullName}</h1>
          <p className="text-navy-500 text-sm mt-1">{email}</p>
        </div>
        <span className={cn("inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold capitalize", PAYMENT_STATUS_COLORS[paymentStatus] ?? "bg-gray-100 text-gray-600")}>
          {paymentStatus}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-card p-5">
            <h2 className="font-display text-lg text-navy-900 mb-4">Profile</h2>
            <dl className="grid grid-cols-2 gap-y-3 text-sm">
              <Field label="Phone" value={client.phone as string | null} />
              <Field label="City / Country" value={[client.city, client.country].filter(Boolean).join(", ") || null} />
              <Field label="Education level" value={client.education_level as string | null} />
              <Field label="Field of study" value={client.field_of_study as string | null} />
              <Field label="GPA" value={client.gpa ? `${client.gpa} / ${client.gpa_scale ?? "?"}` : null} />
              <Field label="Service" value={client.service_type as string | null} />
              <Field label="Assigned agent" value={client.assigned_staff_name as string | null} />
              <Field label="Joined" value={new Date(client.created_at as string).toLocaleDateString("en-NG", { month: "short", day: "numeric", year: "numeric" })} />
            </dl>
          </div>

          <div className="bg-white rounded-xl shadow-card overflow-hidden">
            <h2 className="font-display text-lg text-navy-900 p-5 pb-0">Payments</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm mt-3">
                <thead>
                  <tr className="border-b border-border bg-navy-50">
                    <th className="text-left px-5 py-2.5 text-xs font-semibold text-navy-500 uppercase tracking-wide">Description</th>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-navy-500 uppercase tracking-wide">Amount</th>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-navy-500 uppercase tracking-wide">Status</th>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-navy-500 uppercase tracking-wide hidden sm:table-cell">Raised</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {(payments ?? []).map((p) => (
                    <tr key={p.id}>
                      <td className="px-5 py-3 text-navy-900">{p.description}</td>
                      <td className="px-4 py-3 text-navy-700">{money(p.amount, p.currency ?? "NGN")}</td>
                      <td className="px-4 py-3">
                        <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium capitalize", PAYMENT_STATUS_COLORS[p.status] ?? "bg-gray-100 text-gray-600")}>
                          {p.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-navy-400 text-xs hidden sm:table-cell">
                        {new Date(p.created_at).toLocaleDateString("en-NG", { month: "short", day: "numeric" })}
                      </td>
                    </tr>
                  ))}
                  {(!payments || payments.length === 0) && (
                    <tr><td colSpan={4} className="px-5 py-8 text-center text-navy-400 text-sm">No payments raised yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-card overflow-hidden">
            <h2 className="font-display text-lg text-navy-900 p-5 pb-0">Applications</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm mt-3">
                <thead>
                  <tr className="border-b border-border bg-navy-50">
                    <th className="text-left px-5 py-2.5 text-xs font-semibold text-navy-500 uppercase tracking-wide">Title</th>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-navy-500 uppercase tracking-wide hidden sm:table-cell">Institution</th>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-navy-500 uppercase tracking-wide">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {(applications ?? []).map((a) => (
                    <tr key={a.id}>
                      <td className="px-5 py-3 text-navy-900">{a.title}</td>
                      <td className="px-4 py-3 text-navy-600 hidden sm:table-cell">{[a.institution, a.destination_country].filter(Boolean).join(", ") || "—"}</td>
                      <td className="px-4 py-3">
                        <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium capitalize", APPLICATION_STATUS_COLORS[a.status] ?? "bg-gray-100 text-gray-600")}>
                          {(a.status as string).replace(/_/g, " ")}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {(!applications || applications.length === 0) && (
                    <tr><td colSpan={3} className="px-5 py-8 text-center text-navy-400 text-sm">No applications tracked yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <InvoiceForm clientId={id} />

          <div className="bg-white rounded-xl shadow-card p-5">
            <h2 className="font-display text-lg text-navy-900 mb-3">Documents</h2>
            {(documents ?? []).length === 0 ? (
              <p className="text-navy-400 text-sm">No documents uploaded yet.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {(documents ?? []).map((d) => (
                  <li key={d.id} className="flex items-center justify-between">
                    <span className="text-navy-700 capitalize">{(d.document_type as string).replace(/_/g, " ")}</span>
                    <span className="text-xs text-navy-400 capitalize">{(d.status as string).replace(/_/g, " ")}</span>
                  </li>
                ))}
              </ul>
            )}
            <Link href="/admin/documents" className="text-xs text-crimson-600 hover:underline mt-3 inline-block">
              Review in Documents →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <dt className="text-xs text-navy-400">{label}</dt>
      <dd className="text-navy-900 capitalize">{value || "—"}</dd>
    </div>
  );
}
