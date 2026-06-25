import type { Metadata } from "next";
import { supabaseAdmin } from "@/lib/supabase";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Documents | Admin" };

const DOC_TYPE_LABELS: Record<string, string> = {
  transcript: "Transcript",
  certificate: "Certificate",
  id: "ID Card",
  passport: "Passport",
  sop: "Statement of Purpose",
  lor: "Letter of Recommendation",
  cv: "CV / Résumé",
  test_scores: "Test Scores",
  financial: "Financial Docs",
  other: "Other",
};

const STATUS_COLORS: Record<string, string> = {
  pending_review: "bg-yellow-100 text-yellow-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
  needs_resubmission: "bg-orange-100 text-orange-700",
};

export default async function AdminDocumentsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const params = await searchParams;

  const { data: documents } = await (async () => {
    if (!supabaseAdmin) return { data: [] };
    let q = supabaseAdmin
      .from("documents")
      .select("id, file_name, document_type, file_size, file_type, status, created_at, review_notes, storage_path, client_id, client_profiles(full_name, email)")
      .order("created_at", { ascending: false })
      .limit(100);
    if (params.status) q = q.eq("status", params.status);
    return await q;
  })();

  const { count: pendingCount } = await (supabaseAdmin?.from("documents").select("*", { count: "exact", head: true }).eq("status", "pending_review") ?? Promise.resolve({ count: 0 }));

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl text-navy-900">Documents</h1>
          <p className="text-navy-500 text-sm mt-1">
            {pendingCount ?? 0} pending review
          </p>
        </div>
      </div>

      <div className="flex gap-2 mb-5 flex-wrap">
        {[
          { label: "All", value: "" },
          { label: "Pending Review", value: "pending_review" },
          { label: "Approved", value: "approved" },
          { label: "Rejected", value: "rejected" },
          { label: "Needs Resubmission", value: "needs_resubmission" },
        ].map((f) => (
          <a
            key={f.value}
            href={f.value ? `/admin/documents?status=${f.value}` : "/admin/documents"}
            className={cn(
              "px-3 py-1.5 text-xs border rounded-lg font-medium transition-colors",
              params.status === f.value || (!params.status && !f.value)
                ? "bg-navy-900 text-white border-navy-900"
                : "border-border text-navy-600 hover:bg-navy-50"
            )}
          >
            {f.label}
          </a>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-navy-50">
              <th className="text-left px-5 py-3 text-xs font-semibold text-navy-500 uppercase tracking-wide">Client</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-navy-500 uppercase tracking-wide hidden md:table-cell">Document</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-navy-500 uppercase tracking-wide">Type</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-navy-500 uppercase tracking-wide">Status</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-navy-500 uppercase tracking-wide hidden sm:table-cell">Uploaded</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {(!documents || documents.length === 0) && (
              <tr>
                <td colSpan={6} className="px-5 py-12 text-center text-navy-400 text-sm">
                  No documents found.
                </td>
              </tr>
            )}
            {(documents ?? []).map((doc) => {
              const client = (doc as Record<string, unknown>).client_profiles as { full_name: string; email: string } | null;
              return (
                <tr key={doc.id} className="hover:bg-navy-50/40 transition-colors">
                  <td className="px-5 py-4">
                    <div>
                      <p className="font-medium text-navy-900 text-sm">{client?.full_name ?? "Unknown"}</p>
                      <p className="text-navy-400 text-xs">{client?.email ?? ""}</p>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-navy-700 hidden md:table-cell">
                    <p className="text-sm truncate max-w-48">{doc.file_name}</p>
                    {doc.file_size && <p className="text-xs text-navy-400">{(doc.file_size / 1024).toFixed(0)} KB</p>}
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-xs bg-navy-100 text-navy-700 px-2 py-0.5 rounded-full">
                      {DOC_TYPE_LABELS[doc.document_type] ?? doc.document_type}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", STATUS_COLORS[doc.status] ?? "bg-gray-100 text-gray-600")}>
                      {doc.status.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-navy-400 text-xs hidden sm:table-cell">
                    {new Date(doc.created_at).toLocaleDateString("en-NG", { month: "short", day: "numeric" })}
                  </td>
                  <td className="px-4 py-4">
                    <DocumentActions docId={doc.id} currentStatus={doc.status} storagePath={doc.storage_path} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}

function DocumentActions({ docId, currentStatus, storagePath }: { docId: string; currentStatus: string; storagePath: string }) {
  return (
    <div className="flex items-center gap-1">
      <form action={`/api/admin/documents/${docId}/status`} method="POST">
        <input type="hidden" name="status" value="approved" />
        {currentStatus !== "approved" && (
          <button
            type="submit"
            className="text-xs px-2 py-1 bg-green-50 text-green-700 rounded hover:bg-green-100 transition-colors font-medium"
          >
            Approve
          </button>
        )}
      </form>
      <form action={`/api/admin/documents/${docId}/status`} method="POST">
        <input type="hidden" name="status" value="needs_resubmission" />
        {currentStatus !== "rejected" && currentStatus !== "needs_resubmission" && (
          <button
            type="submit"
            className="text-xs px-2 py-1 bg-orange-50 text-orange-700 rounded hover:bg-orange-100 transition-colors font-medium"
          >
            Request Resubmit
          </button>
        )}
      </form>
    </div>
  );
}
